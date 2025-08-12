import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Ticket, TicketType, Priority, TicketStatus, Impact, Urgency, SlaLevel, TicketSource } from '@prisma/client';

export interface CreateTicketDto {
  title: string;
  description?: string;
  type: TicketType;
  priority?: Priority;
  category?: string;
  subcategory?: string;
  assignedToId?: string;
  impact?: Impact;
  urgency?: Urgency;
  source?: TicketSource;
}

export interface UpdateTicketDto {
  title?: string;
  description?: string;
  priority?: Priority;
  status?: TicketStatus;
  category?: string;
  subcategory?: string;
  assignedToId?: string;
  impact?: Impact;
  urgency?: Urgency;
  rootCause?: string;
  preventiveMeasures?: string;
}

export interface TicketQuery {
  status?: TicketStatus;
  type?: TicketType;
  priority?: Priority;
  assignedToId?: string;
  createdById?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async create(createTicketDto: CreateTicketDto, createdById: string): Promise<Ticket> {
    // Generate ticket number based on type
    const ticketNumber = await this.generateTicketNumber(createTicketDto.type);
    
    // Calculate SLA based on priority and impact
    const slaLevel = this.calculateSlaLevel(createTicketDto.priority, createTicketDto.impact);
    const dueDate = this.calculateDueDate(slaLevel);

    return this.prisma.ticket.create({
      data: {
        ...createTicketDto,
        ticketNumber,
        createdById,
        slaLevel,
        dueDate,
        priority: createTicketDto.priority || Priority.MEDIUM,
        impact: createTicketDto.impact || Impact.LOW,
        urgency: createTicketDto.urgency || Urgency.LOW,
        source: createTicketDto.source || TicketSource.WEB,
      },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true }
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true }
        },
        comments: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        timeEntries: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true }
            }
          }
        }
      },
    });
  }

  async findAll(query: TicketQuery): Promise<{ tickets: Ticket[]; total: number; page: number; totalPages: number }> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100); // Max 100 items per page
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;
    if (query.priority) where.priority = query.priority;
    if (query.assignedToId) where.assignedToId = query.assignedToId;
    if (query.createdById) where.createdById = query.createdById;
    if (query.category) where.category = query.category;
    
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { ticketNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [tickets, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: { id: true, firstName: true, lastName: true, email: true, role: true }
          },
          assignedTo: {
            select: { id: true, firstName: true, lastName: true, email: true, role: true }
          },
          _count: {
            select: {
              comments: true,
              timeEntries: true,
            }
          }
        },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      tickets,
      total,
      page,
      totalPages,
    };
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true }
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true }
        },
        comments: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        timeEntries: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        attachments: true,
        auditLog: {
          orderBy: { createdAt: 'desc' }
        },
        relatedTickets: {
          include: {
            relatedTicket: {
              select: { id: true, ticketNumber: true, title: true, status: true }
            }
          }
        }
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    return ticket;
  }

  async update(id: string, updateTicketDto: UpdateTicketDto, userId: string, userRole?: string): Promise<Ticket> {
    const existingTicket = await this.findOne(id);
    
    // Check if user can edit this ticket
    await this.checkEditPermissions(existingTicket, userId, userRole);
    
    // Log the changes
    await this.logTicketChange(id, userId, 'UPDATE', existingTicket, updateTicketDto);

    // Update resolution date if status changed to RESOLVED or CLOSED
    const updateData: any = { ...updateTicketDto };
    if (updateTicketDto.status && 
        (updateTicketDto.status === TicketStatus.RESOLVED || updateTicketDto.status === TicketStatus.CLOSED) &&
        existingTicket.status !== updateTicketDto.status) {
      updateData.resolutionDate = new Date();
    }

    return this.prisma.ticket.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true }
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true }
        },
        comments: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      },
    });
  }

  private async checkEditPermissions(ticket: Ticket, userId: string, userRole?: string): Promise<void> {
    // Admin and support staff can always edit
    if (userRole && ['ADMIN', 'SUPPORT_L1', 'SUPPORT_L2', 'SUPPORT_L3'].includes(userRole)) {
      return;
    }

    // Ticket creator can edit if ticket is not yet accepted/assigned
    if (ticket.createdById === userId) {
      // Allow editing if ticket is still NEW or OPEN and not assigned
      if ((ticket.status === TicketStatus.NEW || ticket.status === TicketStatus.OPEN) && !ticket.assignedToId) {
        return;
      }
      throw new BadRequestException('You can only edit your tickets that have not been accepted or assigned');
    }

    // Assigned user can edit
    if (ticket.assignedToId === userId) {
      return;
    }

    throw new BadRequestException('You do not have permission to edit this ticket');
  }

  async canUserEditTicket(ticketId: string, userId: string, userRole?: string): Promise<boolean> {
    try {
      const ticket = await this.findOne(ticketId);
      await this.checkEditPermissions(ticket, userId, userRole);
      return true;
    } catch (error) {
      return false;
    }
  }

  async addComment(ticketId: string, userId: string, content: string, isInternal = false) {
    // Verify ticket exists
    await this.findOne(ticketId);

    const comment = await this.prisma.ticketComment.create({
      data: {
        ticketId,
        userId,
        content,
        isInternal,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    // Log the comment addition
    await this.logTicketChange(ticketId, userId, 'COMMENT_ADDED', null, { content: isInternal ? '[Internal Comment]' : '[Comment]' });

    return comment;
  }

  async addTimeEntry(ticketId: string, userId: string, timeSpent: number, description?: string, billable = false) {
    // Verify ticket exists
    await this.findOne(ticketId);

    return this.prisma.timeEntry.create({
      data: {
        ticketId,
        userId,
        timeSpent,
        description,
        billable,
        startTime: new Date(),
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });
  }

  async getTicketStats(userId?: string) {
    const where = userId ? { assignedToId: userId } : {};

    const [
      total,
      open,
      inProgress,
      resolved,
      overdue,
      highPriority,
      critical
    ] = await Promise.all([
      this.prisma.ticket.count({ where }),
      this.prisma.ticket.count({ where: { ...where, status: { in: [TicketStatus.NEW, TicketStatus.OPEN] } } }),
      this.prisma.ticket.count({ where: { ...where, status: TicketStatus.IN_PROGRESS } }),
      this.prisma.ticket.count({ where: { ...where, status: TicketStatus.RESOLVED } }),
      this.prisma.ticket.count({ 
        where: { 
          ...where, 
          dueDate: { lt: new Date() },
          status: { notIn: [TicketStatus.RESOLVED, TicketStatus.CLOSED] }
        } 
      }),
      this.prisma.ticket.count({ where: { ...where, priority: Priority.HIGH } }),
      this.prisma.ticket.count({ where: { ...where, priority: Priority.CRITICAL } }),
    ]);

    return {
      total,
      open,
      inProgress,
      resolved,
      overdue,
      highPriority,
      critical,
    };
  }

  private async generateTicketNumber(type: TicketType): Promise<string> {
    const prefix = {
      [TicketType.INCIDENT]: 'INC',
      [TicketType.SERVICE_REQUEST]: 'REQ',
      [TicketType.PROBLEM]: 'PRB',
      [TicketType.CHANGE]: 'CHG',
    }[type];

    // Get the latest ticket number for this type
    const latestTicket = await this.prisma.ticket.findFirst({
      where: { type },
      orderBy: { createdAt: 'desc' },
      select: { ticketNumber: true }
    });

    let nextNumber = 1;
    if (latestTicket) {
      const match = latestTicket.ticketNumber.match(/\d+$/);
      if (match) {
        nextNumber = parseInt(match[0]) + 1;
      }
    }

    return `${prefix}-${nextNumber.toString().padStart(4, '0')}`;
  }

  private calculateSlaLevel(priority?: Priority, impact?: Impact): SlaLevel {
    if (priority === Priority.CRITICAL || impact === Impact.CRITICAL) {
      return SlaLevel.PREMIUM;
    }
    if (priority === Priority.HIGH || impact === Impact.HIGH) {
      return SlaLevel.STANDARD;
    }
    return SlaLevel.BASIC;
  }

  private calculateDueDate(slaLevel: SlaLevel): Date {
    const now = new Date();
    const hours = {
      [SlaLevel.PREMIUM]: 4,   // 4 hours
      [SlaLevel.STANDARD]: 24, // 24 hours
      [SlaLevel.BASIC]: 72,    // 72 hours
    }[slaLevel];

    return new Date(now.getTime() + hours * 60 * 60 * 1000);
  }

  private async logTicketChange(ticketId: string, userId: string, action: string, oldValue?: any, newValue?: any) {
    await this.prisma.ticketAuditLog.create({
      data: {
        ticketId,
        userId,
        action,
        oldValue: oldValue ? JSON.stringify(oldValue) : null,
        newValue: newValue ? JSON.stringify(newValue) : null,
      },
    });
  }
}
