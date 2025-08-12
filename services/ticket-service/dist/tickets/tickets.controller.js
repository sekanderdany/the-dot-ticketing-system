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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const tickets_service_1 = require("./tickets.service");
const client_1 = require("@prisma/client");
let TicketsController = class TicketsController {
    constructor(ticketsService) {
        this.ticketsService = ticketsService;
    }
    async create(createTicketDto, req) {
        return this.ticketsService.create(createTicketDto, req.user.sub);
    }
    async findAll(query) {
        return this.ticketsService.findAll(query);
    }
    async getStats(req, userId) {
        const targetUserId = req.user.role === 'ADMIN' ? userId : req.user.sub;
        return this.ticketsService.getTicketStats(targetUserId);
    }
    async getMyTickets(req, query) {
        return this.ticketsService.findAll({ ...query, assignedToId: req.user.sub });
    }
    async getCreatedTickets(req, query) {
        return this.ticketsService.findAll({ ...query, createdById: req.user.sub });
    }
    async findOne(id) {
        return this.ticketsService.findOne(id);
    }
    async canEdit(id, req) {
        const canEdit = await this.ticketsService.canUserEditTicket(id, req.user.sub, req.user.role);
        return { canEdit };
    }
    async update(id, updateTicketDto, req) {
        return this.ticketsService.update(id, updateTicketDto, req.user.sub, req.user.role);
    }
    async addComment(id, body, req) {
        return this.ticketsService.addComment(id, req.user.sub, body.content, body.isInternal);
    }
    async addTimeEntry(id, body, req) {
        return this.ticketsService.addTimeEntry(id, req.user.sub, body.timeSpent, body.description, body.billable);
    }
    async assignTicket(id, body, req) {
        return this.ticketsService.update(id, { assignedToId: body.assignedToId }, req.user.sub);
    }
    async updateStatus(id, body, req) {
        return this.ticketsService.update(id, { status: body.status }, req.user.sub);
    }
    async updatePriority(id, body, req) {
        return this.ticketsService.update(id, { priority: body.priority }, req.user.sub);
    }
    getEnums() {
        return {
            ticketTypes: Object.values(client_1.TicketType),
            priorities: Object.values(client_1.Priority),
            statuses: Object.values(client_1.TicketStatus),
            impacts: Object.values(client_1.Impact),
            urgencies: Object.values(client_1.Urgency),
            sources: Object.values(client_1.TicketSource),
        };
    }
};
exports.TicketsController = TicketsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new ticket' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Ticket created successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all tickets with filtering' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of tickets' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get ticket statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ticket statistics' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tickets assigned to current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of assigned tickets' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "getMyTickets", null);
__decorate([
    (0, common_1.Get)('created'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tickets created by current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of created tickets' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "getCreatedTickets", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get ticket by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ticket details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Ticket not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/can-edit'),
    (0, swagger_1.ApiOperation)({ summary: 'Check if current user can edit ticket' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Edit permission check result' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "canEdit", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update ticket' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ticket updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Ticket not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/comments'),
    (0, swagger_1.ApiOperation)({ summary: 'Add comment to ticket' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Comment added successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Ticket not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "addComment", null);
__decorate([
    (0, common_1.Post)(':id/time'),
    (0, swagger_1.ApiOperation)({ summary: 'Log time entry for ticket' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Time entry added successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Ticket not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "addTimeEntry", null);
__decorate([
    (0, common_1.Put)(':id/assign'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign ticket to user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ticket assigned successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Ticket not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "assignTicket", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update ticket status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ticket status updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Ticket not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Put)(':id/priority'),
    (0, swagger_1.ApiOperation)({ summary: 'Update ticket priority' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ticket priority updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Ticket not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "updatePriority", null);
__decorate([
    (0, common_1.Get)('_meta/enums'),
    (0, swagger_1.ApiOperation)({ summary: 'Get enum values for ticket fields' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Enum values' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "getEnums", null);
exports.TicketsController = TicketsController = __decorate([
    (0, swagger_1.ApiTags)('Tickets'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('tickets'),
    __metadata("design:paramtypes", [tickets_service_1.TicketsService])
], TicketsController);
//# sourceMappingURL=tickets.controller.js.map