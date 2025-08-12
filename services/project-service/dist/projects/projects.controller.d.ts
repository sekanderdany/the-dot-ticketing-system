import { ProjectsService, CreateProjectDto, UpdateProjectDto, ProjectQuery } from './projects.service';
import { ProjectRole } from '@prisma/client';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(createProjectDto: CreateProjectDto, req: any): Promise<{
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
    }>;
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
    getStats(req: any, userId?: string): Promise<{
        total: number;
        byStatus: Record<string, number>;
        byPriority: Record<string, number>;
    }>;
    getMyProjects(req: any, query: ProjectQuery): Promise<{
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
    findOne(id: string): Promise<{
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
    }>;
    update(id: string, updateProjectDto: UpdateProjectDto, req: any): Promise<{
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
    }>;
    delete(id: string, req: any): Promise<void>;
    addMember(projectId: string, body: {
        userId: string;
        role?: ProjectRole;
    }, req: any): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.ProjectRole;
        projectId: string;
        userId: string;
        joinedAt: Date;
        leftAt: Date | null;
    }>;
    removeMember(projectId: string, userId: string, req: any): Promise<void>;
    getEnums(): Promise<{
        projectStatus: string[];
        priority: string[];
        projectRole: string[];
    }>;
}
