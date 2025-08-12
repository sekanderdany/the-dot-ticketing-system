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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ProjectsService = class ProjectsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createProjectDto, ownerId) {
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
    async findAll(query) {
        const { page = 1, limit = 10, search, isArchived = false, ...filters } = query;
        const skip = (page - 1) * limit;
        const where = {
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
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Project with ID ${id} not found`);
        }
        return project;
    }
    async update(id, updateProjectDto, userId) {
        const project = await this.findOne(id);
        const member = await this.prisma.projectMember.findFirst({
            where: {
                projectId: id,
                userId,
                role: { in: [client_1.ProjectRole.OWNER, client_1.ProjectRole.MANAGER] },
            },
        });
        if (!member && project.ownerId !== userId) {
            throw new common_1.BadRequestException('You do not have permission to update this project');
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
    async delete(id, userId) {
        const project = await this.findOne(id);
        if (project.ownerId !== userId) {
            throw new common_1.BadRequestException('Only the project owner can delete this project');
        }
        await this.prisma.project.delete({
            where: { id },
        });
    }
    async addMember(projectId, userId, role = client_1.ProjectRole.MEMBER, requesterId) {
        const project = await this.findOne(projectId);
        const requesterMember = await this.prisma.projectMember.findFirst({
            where: {
                projectId,
                userId: requesterId,
                role: { in: [client_1.ProjectRole.OWNER, client_1.ProjectRole.MANAGER] },
            },
        });
        if (!requesterMember && project.ownerId !== requesterId) {
            throw new common_1.BadRequestException('You do not have permission to add members to this project');
        }
        const existingMember = await this.prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId,
                    userId,
                },
            },
        });
        if (existingMember) {
            throw new common_1.BadRequestException('User is already a member of this project');
        }
        return this.prisma.projectMember.create({
            data: {
                projectId,
                userId,
                role,
            },
        });
    }
    async removeMember(projectId, userId, requesterId) {
        const project = await this.findOne(projectId);
        const requesterMember = await this.prisma.projectMember.findFirst({
            where: {
                projectId,
                userId: requesterId,
                role: { in: [client_1.ProjectRole.OWNER, client_1.ProjectRole.MANAGER] },
            },
        });
        if (!requesterMember && project.ownerId !== requesterId) {
            throw new common_1.BadRequestException('You do not have permission to remove members from this project');
        }
        if (project.ownerId === userId) {
            throw new common_1.BadRequestException('Cannot remove the project owner');
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
    async getProjectStats(userId) {
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
            }, {}),
            byPriority: byPriority.reduce((acc, item) => {
                acc[item.priority] = item._count.id;
                return acc;
            }, {}),
        };
    }
    async getUserProjects(userId, query) {
        const { page = 1, limit = 10, search, ...filters } = query;
        const skip = (page - 1) * limit;
        const where = {
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
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map