import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Application, ApplicationStatus, ApplicationEnvironment, Team, TeamRole } from '@prisma/client';

export interface CreateApplicationDto {
  name: string;
  description?: string;
  version?: string;
  repository?: string;
  technology?: string;
  environment?: ApplicationEnvironment;
}

export interface UpdateApplicationDto {
  name?: string;
  description?: string;
  status?: ApplicationStatus;
  version?: string;
  repository?: string;
  technology?: string;
  environment?: ApplicationEnvironment;
  managerId?: string;
}

export interface ApplicationQuery {
  status?: ApplicationStatus;
  environment?: ApplicationEnvironment;
  ownerId?: string;
  managerId?: string;
  search?: string;
  page?: number;
  limit?: number;
  isArchived?: boolean;
}

export interface CreateTeamDto {
  name: string;
  description?: string;
}

export interface UpdateTeamDto {
  name?: string;
  description?: string;
  leaderId?: string;
  supportL1?: string[];
  supportL2?: string[];
  supportL3?: string[];
}

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async create(createApplicationDto: CreateApplicationDto, ownerId: string): Promise<Application> {
    return this.prisma.application.create({
      data: {
        ...createApplicationDto,
        ownerId,
      },
      include: {
        teams: {
          include: {
            team: true,
          },
        },
      },
    });
  }

  async findAll(query: ApplicationQuery) {
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
        { technology: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        skip,
        take: limit,
        include: {
          teams: {
            include: {
              team: {
                include: {
                  members: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.application.count({ where }),
    ]);

    return {
      data: applications,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Application> {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        teams: {
          include: {
            team: {
              include: {
                members: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    return application;
  }

  async update(id: string, updateApplicationDto: UpdateApplicationDto, userId: string): Promise<Application> {
    const application = await this.findOne(id);

    // Check if user has permission to update
    if (application.ownerId !== userId && application.managerId !== userId) {
      throw new BadRequestException('You do not have permission to update this application');
    }

    return this.prisma.application.update({
      where: { id },
      data: updateApplicationDto,
      include: {
        teams: {
          include: {
            team: {
              include: {
                members: true,
              },
            },
          },
        },
      },
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    const application = await this.findOne(id);

    // Only owner can delete
    if (application.ownerId !== userId) {
      throw new BadRequestException('Only the application owner can delete this application');
    }

    await this.prisma.application.delete({
      where: { id },
    });
  }

  async assignTeam(applicationId: string, teamId: string, userId: string) {
    const application = await this.findOne(applicationId);
    
    // Check permission
    if (application.ownerId !== userId && application.managerId !== userId) {
      throw new BadRequestException('You do not have permission to assign teams to this application');
    }

    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    // Check if already assigned
    const existing = await this.prisma.applicationTeam.findUnique({
      where: {
        applicationId_teamId: {
          applicationId,
          teamId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Team is already assigned to this application');
    }

    return this.prisma.applicationTeam.create({
      data: {
        applicationId,
        teamId,
      },
      include: {
        team: true,
      },
    });
  }

  async unassignTeam(applicationId: string, teamId: string, userId: string) {
    const application = await this.findOne(applicationId);
    
    // Check permission
    if (application.ownerId !== userId && application.managerId !== userId) {
      throw new BadRequestException('You do not have permission to unassign teams from this application');
    }

    await this.prisma.applicationTeam.delete({
      where: {
        applicationId_teamId: {
          applicationId,
          teamId,
        },
      },
    });
  }

  async getApplicationStats(userId?: string) {
    const where = userId ? { ownerId: userId } : {};

    const [total, byStatus, byEnvironment] = await Promise.all([
      this.prisma.application.count({ where }),
      this.prisma.application.groupBy({
        by: ['status'],
        where,
        _count: {
          id: true,
        },
      }),
      this.prisma.application.groupBy({
        by: ['environment'],
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
      byEnvironment: byEnvironment.reduce((acc, item) => {
        acc[item.environment] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  // Team management methods
  async createTeam(createTeamDto: CreateTeamDto): Promise<Team> {
    return this.prisma.team.create({
      data: createTeamDto,
      include: {
        members: true,
        applications: {
          include: {
            application: true,
          },
        },
      },
    });
  }

  async findAllTeams(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [teams, total] = await Promise.all([
      this.prisma.team.findMany({
        where,
        skip,
        take: limit,
        include: {
          members: true,
          applications: {
            include: {
              application: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.team.count({ where }),
    ]);

    return {
      data: teams,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOneTeam(id: string): Promise<Team> {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        members: true,
        applications: {
          include: {
            application: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    return team;
  }

  async updateTeam(id: string, updateTeamDto: UpdateTeamDto): Promise<Team> {
    const team = await this.findOneTeam(id);

    return this.prisma.team.update({
      where: { id },
      data: updateTeamDto,
      include: {
        members: true,
        applications: {
          include: {
            application: true,
          },
        },
      },
    });
  }

  async deleteTeam(id: string): Promise<void> {
    const team = await this.findOneTeam(id);

    await this.prisma.team.delete({
      where: { id },
    });
  }

  async addTeamMember(teamId: string, userId: string, role: TeamRole = TeamRole.MEMBER) {
    const team = await this.findOneTeam(teamId);

    // Check if user is already a member
    const existing = await this.prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('User is already a member of this team');
    }

    return this.prisma.teamMember.create({
      data: {
        teamId,
        userId,
        role,
      },
    });
  }

  async removeTeamMember(teamId: string, userId: string) {
    await this.prisma.teamMember.delete({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    });
  }
}
