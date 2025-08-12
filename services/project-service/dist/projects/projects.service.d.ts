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
export declare class ProjectsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createProjectDto: CreateProjectDto, ownerId: string): Promise<Project>;
    findAll(query: ProjectQuery): Promise<{
        data: ({
            tasks: {
                id: string;
                description: string | null;
                status: import(".prisma/client").$Enums.TaskStatus;
                priority: import(".prisma/client").$Enums.Priority;
                startDate: Date | null;
                dueDate: Date | null;
                progress: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                projectId: string;
                assigneeId: string | null;
                reporterId: string;
                completedAt: Date | null;
                estimatedHours: number | null;
                actualHours: number | null;
            }[];
            milestones: {
                id: string;
                description: string | null;
                name: string;
                status: import(".prisma/client").$Enums.MilestoneStatus;
                dueDate: Date;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                projectId: string;
                completedAt: Date | null;
            }[];
            members: {
                id: string;
                role: import(".prisma/client").$Enums.ProjectRole;
                projectId: string;
                userId: string;
                joinedAt: Date;
                leftAt: Date | null;
            }[];
        } & {
            id: string;
            description: string | null;
            name: string;
            status: import(".prisma/client").$Enums.ProjectStatus;
            priority: import(".prisma/client").$Enums.Priority;
            ownerId: string;
            managerId: string | null;
            startDate: Date | null;
            endDate: Date | null;
            dueDate: Date | null;
            progress: number;
            budget: number | null;
            isActive: boolean;
            isArchived: boolean;
            createdAt: Date;
            updatedAt: Date;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    findOne(id: string): Promise<Project>;
    update(id: string, updateProjectDto: UpdateProjectDto, userId: string): Promise<Project>;
    delete(id: string, userId: string): Promise<void>;
    addMember(projectId: string, userId: string, role: ProjectRole, requesterId: string): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.ProjectRole;
        projectId: string;
        userId: string;
        joinedAt: Date;
        leftAt: Date | null;
    }>;
    removeMember(projectId: string, userId: string, requesterId: string): Promise<void>;
    getProjectStats(userId?: string): Promise<{
        total: number;
        byStatus: Record<string, number>;
        byPriority: Record<string, number>;
    }>;
    getUserProjects(userId: string, query: ProjectQuery): Promise<{
        data: ({
            tasks: {
                id: string;
                description: string | null;
                status: import(".prisma/client").$Enums.TaskStatus;
                priority: import(".prisma/client").$Enums.Priority;
                startDate: Date | null;
                dueDate: Date | null;
                progress: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                projectId: string;
                assigneeId: string | null;
                reporterId: string;
                completedAt: Date | null;
                estimatedHours: number | null;
                actualHours: number | null;
            }[];
            milestones: {
                id: string;
                description: string | null;
                name: string;
                status: import(".prisma/client").$Enums.MilestoneStatus;
                dueDate: Date;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                projectId: string;
                completedAt: Date | null;
            }[];
            members: {
                id: string;
                role: import(".prisma/client").$Enums.ProjectRole;
                projectId: string;
                userId: string;
                joinedAt: Date;
                leftAt: Date | null;
            }[];
        } & {
            id: string;
            description: string | null;
            name: string;
            status: import(".prisma/client").$Enums.ProjectStatus;
            priority: import(".prisma/client").$Enums.Priority;
            ownerId: string;
            managerId: string | null;
            startDate: Date | null;
            endDate: Date | null;
            dueDate: Date | null;
            progress: number;
            budget: number | null;
            isActive: boolean;
            isArchived: boolean;
            createdAt: Date;
            updatedAt: Date;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
}
