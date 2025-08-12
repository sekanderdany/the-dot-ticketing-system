"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let TicketsService = class TicketsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createTicketDto, createdById) {
        const ticketNumber = await this.generateTicketNumber(createTicketDto.type);
        const slaLevel = this.calculateSlaLevel(createTicketDto.priority, createTicketDto.impact);
        const dueDate = this.calculateDueDate(slaLevel);
        return this.prisma.ticket.create({
            data: {
                ...createTicketDto,
                ticketNumber,
                createdById,
                slaLevel,
                dueDate,
                priority: createTicketDto.priority || client_1.Priority.MEDIUM,
                impact: createTicketDto.impact || client_1.Impact.LOW,
                urgency: createTicketDto.urgency || client_1.Urgency.LOW,
                source: createTicketDto.source || client_1.TicketSource.WEB,
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
    async findAll(query) {
        const page = query.page || 1;
        const limit = Math.min(query.limit || 20, 100);
        const skip = (page - 1) * limit;
        const where = {};
        if (query.status)
            where.status = query.status;
        if (query.type)
            where.type = query.type;
        if (query.priority)
            where.priority = query.priority;
        if (query.assignedToId)
            where.assignedToId = query.assignedToId;
        if (query.createdById)
            where.createdById = query.createdById;
        if (query.category)
            where.category = query.category;
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
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Ticket with ID ${id} not found`);
        }
        return ticket;
    }
    async update(id, updateTicketDto, userId, userRole) {
        const existingTicket = await this.findOne(id);
        await this.checkEditPermissions(existingTicket, userId, userRole);
        await this.logTicketChange(id, userId, 'UPDATE', existingTicket, updateTicketDto);
        const updateData = { ...updateTicketDto };
        if (updateTicketDto.status &&
            (updateTicketDto.status === client_1.TicketStatus.RESOLVED || updateTicketDto.status === client_1.TicketStatus.CLOSED) &&
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
    async checkEditPermissions(ticket, userId, userRole) {
        if (userRole && ['ADMIN', 'SUPPORT_L1', 'SUPPORT_L2', 'SUPPORT_L3'].includes(userRole)) {
            return;
        }
        if (ticket.createdById === userId) {
            if ((ticket.status === client_1.TicketStatus.NEW || ticket.status === client_1.TicketStatus.OPEN) && !ticket.assignedToId) {
                return;
            }
            throw new common_1.BadRequestException('You can only edit your tickets that have not been accepted or assigned');
        }
        if (ticket.assignedToId === userId) {
            return;
        }
        throw new common_1.BadRequestException('You do not have permission to edit this ticket');
    }
    async canUserEditTicket(ticketId, userId, userRole) {
        try {
            const ticket = await this.findOne(ticketId);
            await this.checkEditPermissions(ticket, userId, userRole);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async addComment(ticketId, userId, content, isInternal = false) {
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
        await this.logTicketChange(ticketId, userId, 'COMMENT_ADDED', null, { content: isInternal ? '[Internal Comment]' : '[Comment]' });
        return comment;
    }
    async addTimeEntry(ticketId, userId, timeSpent, description, billable = false) {
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
    async getTicketStats(userId) {
        const where = userId ? { assignedToId: userId } : {};
        const [total, open, inProgress, resolved, overdue, highPriority, critical] = await Promise.all([
            this.prisma.ticket.count({ where }),
            this.prisma.ticket.count({ where: { ...where, status: { in: [client_1.TicketStatus.NEW, client_1.TicketStatus.OPEN] } } }),
            this.prisma.ticket.count({ where: { ...where, status: client_1.TicketStatus.IN_PROGRESS } }),
            this.prisma.ticket.count({ where: { ...where, status: client_1.TicketStatus.RESOLVED } }),
            this.prisma.ticket.count({
                where: {
                    ...where,
                    dueDate: { lt: new Date() },
                    status: { notIn: [client_1.TicketStatus.RESOLVED, client_1.TicketStatus.CLOSED] }
                }
            }),
            this.prisma.ticket.count({ where: { ...where, priority: client_1.Priority.HIGH } }),
            this.prisma.ticket.count({ where: { ...where, priority: client_1.Priority.CRITICAL } }),
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
    async generateTicketNumber(type) {
        const prefix = {
            [client_1.TicketType.INCIDENT]: 'INC',
            [client_1.TicketType.SERVICE_REQUEST]: 'REQ',
            [client_1.TicketType.PROBLEM]: 'PRB',
            [client_1.TicketType.CHANGE]: 'CHG',
        }[type];
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
    calculateSlaLevel(priority, impact) {
        if (priority === client_1.Priority.CRITICAL || impact === client_1.Impact.CRITICAL) {
            return client_1.SlaLevel.PREMIUM;
        }
        if (priority === client_1.Priority.HIGH || impact === client_1.Impact.HIGH) {
            return client_1.SlaLevel.STANDARD;
        }
        return client_1.SlaLevel.BASIC;
    }
    calculateDueDate(slaLevel) {
        const now = new Date();
        const hours = {
            [client_1.SlaLevel.PREMIUM]: 4,
            [client_1.SlaLevel.STANDARD]: 24,
            [client_1.SlaLevel.BASIC]: 72,
        }[slaLevel];
        return new Date(now.getTime() + hours * 60 * 60 * 1000);
    }
    async logTicketChange(ticketId, userId, action, oldValue, newValue) {
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
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TicketsService);
//# sourceMappingURL=tickets.service.js.map