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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { 
  ApplicationsService, 
  CreateApplicationDto, 
  UpdateApplicationDto, 
  ApplicationQuery,
  CreateTeamDto,
  UpdateTeamDto
} from './applications.service';

@ApiTags('Applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new application' })
  @ApiResponse({ status: 201, description: 'Application created successfully' })
  async create(@Body() createApplicationDto: CreateApplicationDto, @Request() req) {
    return this.applicationsService.create(createApplicationDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all applications with filtering' })
  @ApiResponse({ status: 200, description: 'List of applications' })
  async findAll(@Query() query: ApplicationQuery) {
    return this.applicationsService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get application statistics' })
  @ApiResponse({ status: 200, description: 'Application statistics' })
  async getStats(@Request() req, @Query('userId') userId?: string) {
    // If user is not admin, only show their own stats
    const targetUserId = req.user.role === 'ADMIN' ? userId : req.user.sub;
    return this.applicationsService.getApplicationStats(targetUserId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application by ID' })
  @ApiResponse({ status: 200, description: 'Application details' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update application' })
  @ApiResponse({ status: 200, description: 'Application updated successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async update(
    @Param('id') id: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
    @Request() req,
  ) {
    return this.applicationsService.update(id, updateApplicationDto, req.user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete application' })
  @ApiResponse({ status: 204, description: 'Application deleted successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async delete(@Param('id') id: string, @Request() req) {
    return this.applicationsService.delete(id, req.user.sub);
  }

  @Post(':id/teams/:teamId')
  @ApiOperation({ summary: 'Assign team to application' })
  @ApiResponse({ status: 201, description: 'Team assigned successfully' })
  async assignTeam(
    @Param('id') applicationId: string,
    @Param('teamId') teamId: string,
    @Request() req,
  ) {
    return this.applicationsService.assignTeam(applicationId, teamId, req.user.sub);
  }

  @Delete(':id/teams/:teamId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unassign team from application' })
  @ApiResponse({ status: 204, description: 'Team unassigned successfully' })
  async unassignTeam(
    @Param('id') applicationId: string,
    @Param('teamId') teamId: string,
    @Request() req,
  ) {
    return this.applicationsService.unassignTeam(applicationId, teamId, req.user.sub);
  }

  @Get('_meta/enums')
  @ApiOperation({ summary: 'Get application-related enums' })
  @ApiResponse({ status: 200, description: 'Application enums' })
  async getEnums() {
    return {
      applicationStatus: ['ACTIVE', 'MAINTENANCE', 'DEPRECATED', 'RETIRED'],
      environment: ['DEVELOPMENT', 'STAGING', 'PRODUCTION'],
    };
  }
}

@ApiTags('Teams')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('teams')
export class TeamsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new team' })
  @ApiResponse({ status: 201, description: 'Team created successfully' })
  async create(@Body() createTeamDto: CreateTeamDto) {
    return this.applicationsService.createTeam(createTeamDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all teams' })
  @ApiResponse({ status: 200, description: 'List of teams' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.applicationsService.findAllTeams(page, limit, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get team by ID' })
  @ApiResponse({ status: 200, description: 'Team details' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  async findOne(@Param('id') id: string) {
    return this.applicationsService.findOneTeam(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update team' })
  @ApiResponse({ status: 200, description: 'Team updated successfully' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  async update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto) {
    return this.applicationsService.updateTeam(id, updateTeamDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete team' })
  @ApiResponse({ status: 204, description: 'Team deleted successfully' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  async delete(@Param('id') id: string) {
    return this.applicationsService.deleteTeam(id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add member to team' })
  @ApiResponse({ status: 201, description: 'Member added successfully' })
  async addMember(
    @Param('id') teamId: string,
    @Body() body: { userId: string; role?: string },
  ) {
    return this.applicationsService.addTeamMember(teamId, body.userId, body.role as any);
  }

  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove member from team' })
  @ApiResponse({ status: 204, description: 'Member removed successfully' })
  async removeMember(
    @Param('id') teamId: string,
    @Param('userId') userId: string,
  ) {
    return this.applicationsService.removeTeamMember(teamId, userId);
  }
}
