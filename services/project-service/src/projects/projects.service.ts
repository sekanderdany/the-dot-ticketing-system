import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Project, ProjectStatus, Priority, ProjectRole } from '@prisma/client';

export interface CreateProjectDto {
  name: string;
  description?: string;
  priority?: Priority;
  startDate?: Date;
  endDate?: Date;
  dueDate?: Date;
  budget?: number;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  priority?: Priority;
  startDate?: Date;
  endDate?: Date;
  dueDate?: Date;
  budget?: number;
  progress?: number;
  managerId?: string;
}

export interface ProjectQuery {
  status?: ProjectStatus;
  priority?: Priority;
  ownerId?: string;
  managerId?: string;
  search?: string;
  page?: number;
  limit?: number;
  isArchived?: boolean;
}

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto, ownerId: string): Promise<Project> {
    return this.prisma.project.create({
      data: {
        ...createProjectDto,
        ownerId,
      },
      include: {
        members: true,
        tasks: true,
        milestones: true,
      },
    });
  }

  async findAll(query: ProjectQuery) {
    const { page = 1, limit = 10, search, isArchived = false, ...filters } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      isArchived,
      ...filters,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        include: {
          members: true,
          tasks: {
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
          milestones: {
            where: { isActive: true },
            orderBy: { dueDate: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      data: projects,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        members: true,
        tasks: {
          orderBy: { createdAt: 'desc' },
        },
        milestones: {
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string): Promise<Project> {
    const project = await this.findOne(id);

    // Check if user has permission to update
    const member = await this.prisma.projectMember.findFirst({
      where: {
        projectId: id,
        userId,
        role: { in: [ProjectRole.OWNER, ProjectRole.MANAGER] },
      },
    });

    if (!member && project.ownerId !== userId) {
      throw new BadRequestException('You do not have permission to update this project');
    }

    return this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
      include: {
        members: true,
        tasks: true,
        milestones: true,
      },
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    const project = await this.findOne(id);

    // Only owner can delete
    if (project.ownerId !== userId) {
      throw new BadRequestException('Only the project owner can delete this project');
    }

    await this.prisma.project.delete({
      where: { id },
    });
  }

  async addMember(projectId: string, userId: string, role: ProjectRole = ProjectRole.MEMBER, requesterId: string) {
    const project = await this.findOne(projectId);

    // Check if requester has permission
    const requesterMember = await this.prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: requesterId,
        role: { in: [ProjectRole.OWNER, ProjectRole.MANAGER] },
      },
    });

    if (!requesterMember && project.ownerId !== requesterId) {
      throw new BadRequestException('You do not have permission to add members to this project');
    }

    // Check if user is already a member
    const existingMember = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (existingMember) {
      throw new BadRequestException('User is already a member of this project');
    }

    return this.prisma.projectMember.create({
      data: {
        projectId,
        userId,
        role,
      },
    });
  }

  async removeMember(projectId: string, userId: string, requesterId: string) {
    const project = await this.findOne(projectId);

    // Check if requester has permission
    const requesterMember = await this.prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: requesterId,
        role: { in: [ProjectRole.OWNER, ProjectRole.MANAGER] },
      },
    });

    if (!requesterMember && project.ownerId !== requesterId) {
      throw new BadRequestException('You do not have permission to remove members from this project');
    }

    // Cannot remove the owner
    if (project.ownerId === userId) {
      throw new BadRequestException('Cannot remove the project owner');
    }

    await this.prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });
  }

  async getProjectStats(userId?: string) {
    const where = userId ? { ownerId: userId } : {};

    const [total, byStatus, byPriority] = await Promise.all([
      this.prisma.project.count({ where }),
      this.prisma.project.groupBy({
        by: ['status'],
        where,
        _count: {
          id: true,
        },
      }),
      this.prisma.project.groupBy({
        by: ['priority'],
        where,
        _count: {
          id: true,
        },
      }),
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      byPriority: byPriority.reduce((acc, item) => {
        acc[item.priority] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  async getUserProjects(userId: string, query: ProjectQuery) {
    const { page = 1, limit = 10, search, ...filters } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      isArchived: false,
      OR: [
        { ownerId: userId },
        { managerId: userId },
        { members: { some: { userId } } },
      ],
      ...filters,
    };

    if (search) {
      where.AND = [
        where.OR,
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
      delete where.OR;
    }

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        include: {
          members: true,
          tasks: {
            take: 3,
            orderBy: { createdAt: 'desc' },
          },
          milestones: {
            where: { isActive: true },
            take: 3,
            orderBy: { dueDate: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      data: projects,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
