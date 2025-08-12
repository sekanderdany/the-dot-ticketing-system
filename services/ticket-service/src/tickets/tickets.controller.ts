import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TicketsService, CreateTicketDto, UpdateTicketDto, TicketQuery } from './tickets.service';
import { TicketType, Priority, TicketStatus, Impact, Urgency, TicketSource } from '@prisma/client';

@ApiTags('Tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new ticket' })
  @ApiResponse({ status: 201, description: 'Ticket created successfully' })
  async create(@Body() createTicketDto: CreateTicketDto, @Request() req) {
    return this.ticketsService.create(createTicketDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tickets with filtering' })
  @ApiResponse({ status: 200, description: 'List of tickets' })
  async findAll(@Query() query: TicketQuery) {
    return this.ticketsService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get ticket statistics' })
  @ApiResponse({ status: 200, description: 'Ticket statistics' })
  async getStats(@Request() req, @Query('userId') userId?: string) {
    // If user is not admin, only show their own stats
    const targetUserId = req.user.role === 'ADMIN' ? userId : req.user.sub;
    return this.ticketsService.getTicketStats(targetUserId);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get tickets assigned to current user' })
  @ApiResponse({ status: 200, description: 'List of assigned tickets' })
  async getMyTickets(@Request() req, @Query() query: Omit<TicketQuery, 'assignedToId'>) {
    return this.ticketsService.findAll({ ...query, assignedToId: req.user.sub });
  }

  @Get('created')
  @ApiOperation({ summary: 'Get tickets created by current user' })
  @ApiResponse({ status: 200, description: 'List of created tickets' })
  async getCreatedTickets(@Request() req, @Query() query: Omit<TicketQuery, 'createdById'>) {
    return this.ticketsService.findAll({ ...query, createdById: req.user.sub });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket by ID' })
  @ApiResponse({ status: 200, description: 'Ticket details' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Get(':id/can-edit')
  @ApiOperation({ summary: 'Check if current user can edit ticket' })
  @ApiResponse({ status: 200, description: 'Edit permission check result' })
  async canEdit(@Param('id') id: string, @Request() req) {
    const canEdit = await this.ticketsService.canUserEditTicket(id, req.user.sub, req.user.role);
    return { canEdit };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update ticket' })
  @ApiResponse({ status: 200, description: 'Ticket updated successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async update(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @Request() req
  ) {
    return this.ticketsService.update(id, updateTicketDto, req.user.sub, req.user.role);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add comment to ticket' })
  @ApiResponse({ status: 201, description: 'Comment added successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async addComment(
    @Param('id') id: string,
    @Body() body: { content: string; isInternal?: boolean },
    @Request() req
  ) {
    return this.ticketsService.addComment(id, req.user.sub, body.content, body.isInternal);
  }

  @Post(':id/time')
  @ApiOperation({ summary: 'Log time entry for ticket' })
  @ApiResponse({ status: 201, description: 'Time entry added successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async addTimeEntry(
    @Param('id') id: string,
    @Body() body: { timeSpent: number; description?: string; billable?: boolean },
    @Request() req
  ) {
    return this.ticketsService.addTimeEntry(
      id,
      req.user.sub,
      body.timeSpent,
      body.description,
      body.billable
    );
  }

  @Put(':id/assign')
  @ApiOperation({ summary: 'Assign ticket to user' })
  @ApiResponse({ status: 200, description: 'Ticket assigned successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async assignTicket(
    @Param('id') id: string,
    @Body() body: { assignedToId: string },
    @Request() req
  ) {
    return this.ticketsService.update(id, { assignedToId: body.assignedToId }, req.user.sub);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update ticket status' })
  @ApiResponse({ status: 200, description: 'Ticket status updated successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: TicketStatus },
    @Request() req
  ) {
    return this.ticketsService.update(id, { status: body.status }, req.user.sub);
  }

  @Put(':id/priority')
  @ApiOperation({ summary: 'Update ticket priority' })
  @ApiResponse({ status: 200, description: 'Ticket priority updated successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async updatePriority(
    @Param('id') id: string,
    @Body() body: { priority: Priority },
    @Request() req
  ) {
    return this.ticketsService.update(id, { priority: body.priority }, req.user.sub);
  }

  // Helper endpoint to get enum values for frontend
  @Get('_meta/enums')
  @ApiOperation({ summary: 'Get enum values for ticket fields' })
  @ApiResponse({ status: 200, description: 'Enum values' })
  getEnums() {
    return {
      ticketTypes: Object.values(TicketType),
      priorities: Object.values(Priority),
      statuses: Object.values(TicketStatus),
      impacts: Object.values(Impact),
      urgencies: Object.values(Urgency),
      sources: Object.values(TicketSource),
    };
  }
}
