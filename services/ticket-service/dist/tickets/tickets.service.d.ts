import { PrismaService } from '../prisma/prisma.service';
import { Ticket, TicketType, Priority, TicketStatus, Impact, Urgency, TicketSource } from '@prisma/client';
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
export declare class TicketsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createTicketDto: CreateTicketDto, createdById: string): Promise<Ticket>;
    findAll(query: TicketQuery): Promise<{
        tickets: Ticket[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<Ticket>;
    update(id: string, updateTicketDto: UpdateTicketDto, userId: string, userRole?: string): Promise<Ticket>;
    private checkEditPermissions;
    canUserEditTicket(ticketId: string, userId: string, userRole?: string): Promise<boolean>;
    addComment(ticketId: string, userId: string, content: string, isInternal?: boolean): Promise<{
        user: {
            email: string;
            firstName: string;
            lastName: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        content: string;
        ticketId: string;
        isInternal: boolean;
    }>;
    addTimeEntry(ticketId: string, userId: string, timeSpent: number, description?: string, billable?: boolean): Promise<{
        user: {
            email: string;
            firstName: string;
            lastName: string;
            id: string;
        };
    } & {
        description: string | null;
        id: string;
        createdAt: Date;
        userId: string;
        ticketId: string;
        timeSpent: number;
        billable: boolean;
        startTime: Date;
        endTime: Date | null;
    }>;
    getTicketStats(userId?: string): Promise<{
        total: number;
        open: number;
        inProgress: number;
        resolved: number;
        overdue: number;
        highPriority: number;
        critical: number;
    }>;
    private generateTicketNumber;
    private calculateSlaLevel;
    private calculateDueDate;
    private logTicketChange;
}
