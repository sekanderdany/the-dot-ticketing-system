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
import { ProjectsService, CreateProjectDto, UpdateProjectDto, ProjectQuery } from './projects.service';
import { ProjectRole } from '@prisma/client';

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  async create(@Body() createProjectDto: CreateProjectDto, @Request() req) {
    return this.projectsService.create(createProjectDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects with filtering' })
  @ApiResponse({ status: 200, description: 'List of projects' })
  async findAll(@Query() query: ProjectQuery) {
    return this.projectsService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get project statistics' })
  @ApiResponse({ status: 200, description: 'Project statistics' })
  async getStats(@Request() req, @Query('userId') userId?: string) {
    // If user is not admin, only show their own stats
    const targetUserId = req.user.role === 'ADMIN' ? userId : req.user.sub;
    return this.projectsService.getProjectStats(targetUserId);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user projects' })
  @ApiResponse({ status: 200, description: 'User projects' })
  async getMyProjects(@Request() req, @Query() query: ProjectQuery) {
    return this.projectsService.getUserProjects(req.user.sub, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiResponse({ status: 200, description: 'Project details' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update project' })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req,
  ) {
    return this.projectsService.update(id, updateProjectDto, req.user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete project' })
  @ApiResponse({ status: 204, description: 'Project deleted successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async delete(@Param('id') id: string, @Request() req) {
    return this.projectsService.delete(id, req.user.sub);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add member to project' })
  @ApiResponse({ status: 201, description: 'Member added successfully' })
  async addMember(
    @Param('id') projectId: string,
    @Body() body: { userId: string; role?: ProjectRole },
    @Request() req,
  ) {
    return this.projectsService.addMember(
      projectId,
      body.userId,
      body.role,
      req.user.sub,
    );
  }

  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove member from project' })
  @ApiResponse({ status: 204, description: 'Member removed successfully' })
  async removeMember(
    @Param('id') projectId: string,
    @Param('userId') userId: string,
    @Request() req,
  ) {
    return this.projectsService.removeMember(projectId, userId, req.user.sub);
  }

  @Get('_meta/enums')
  @ApiOperation({ summary: 'Get project-related enums' })
  @ApiResponse({ status: 200, description: 'Project enums' })
  async getEnums() {
    return {
      projectStatus: ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'],
      priority: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      projectRole: ['OWNER', 'MANAGER', 'MEMBER', 'VIEWER'],
    };
  }
}
