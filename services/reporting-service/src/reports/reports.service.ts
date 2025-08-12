import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportType, ReportFormat, ReportStatus } from '@prisma/client';

export interface CreateReportDto {
  name: string;
  description?: string;
  type: ReportType;
  format?: ReportFormat;
  parameters?: any;
}

export interface ReportQuery {
  type?: ReportType;
  status?: ReportStatus;
  requestedBy?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async create(createReportDto: CreateReportDto, requestedBy: string) {
    const report = await this.prisma.report.create({
      data: {
        ...createReportDto,
        requestedBy,
        status: ReportStatus.PENDING,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Trigger report generation (simplified - in real implementation would use a queue)
    this.generateReport(report.id);

    return report;
  }

  async findAll(query: ReportQuery) {
    const { page = 1, limit = 10, ...filters } = query;
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where: filters,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.report.count({ where: filters }),
    ]);

    return {
      data: reports,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    return report;
  }

  async delete(id: string, userId: string) {
    const report = await this.findOne(id);

    // Only the requester or admin can delete
    if (report.requestedBy !== userId) {
      throw new NotFoundException('You can only delete your own reports');
    }

    await this.prisma.report.delete({
      where: { id },
    });
  }

  async getUserReports(userId: string, query: ReportQuery) {
    return this.findAll({
      ...query,
      requestedBy: userId,
    });
  }

  async getReportStats(userId?: string) {
    const where = userId ? { requestedBy: userId } : {};

    const [total, byType, byStatus] = await Promise.all([
      this.prisma.report.count({ where }),
      this.prisma.report.groupBy({
        by: ['type'],
        where,
        _count: {
          id: true,
        },
      }),
      this.prisma.report.groupBy({
        by: ['status'],
        where,
        _count: {
          id: true,
        },
      }),
    ]);

    return {
      total,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  private async generateReport(reportId: string) {
    try {
      await this.prisma.report.update({
        where: { id: reportId },
        data: {
          status: ReportStatus.GENERATING,
        },
      });

      const report = await this.findOne(reportId);
      
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate mock CSV data based on report type
      const csvData = this.generateMockData(report.type);
      const fileName = `${report.name.replace(/\s+/g, '_')}_${Date.now()}.csv`;
      
      await this.prisma.report.update({
        where: { id: reportId },
        data: {
          status: ReportStatus.COMPLETED,
          generatedAt: new Date(),
          fileName,
          fileSize: csvData.length,
          downloadUrl: `/api/v1/reports/${reportId}/download`,
        },
      });
    } catch (error) {
      await this.prisma.report.update({
        where: { id: reportId },
        data: {
          status: ReportStatus.FAILED,
        },
      });
    }
  }

  private generateMockData(type: ReportType): string {
    switch (type) {
      case ReportType.TICKETS:
        return 'ID,Title,Type,Status,Priority,Created By,Assigned To,Created At,Updated At\n' +
               'TKT-001,Login Issue,INCIDENT,OPEN,HIGH,user1,support1,2025-07-19,2025-07-19\n' +
               'TKT-002,New Feature Request,SERVICE_REQUEST,IN_PROGRESS,MEDIUM,user2,dev1,2025-07-18,2025-07-19\n';
      
      case ReportType.PROJECTS:
        return 'ID,Name,Status,Priority,Owner,Progress,Created At,Due Date\n' +
               'PRJ-001,Website Redesign,ACTIVE,HIGH,pm1,75%,2025-07-01,2025-08-15\n' +
               'PRJ-002,Mobile App,PLANNING,MEDIUM,pm2,10%,2025-07-15,2025-09-30\n';
      
      case ReportType.USERS:
        return 'ID,Email,Name,Role,Status,Created At,Last Login\n' +
               'USR-001,user1@example.com,John Doe,DEVELOPER,ACTIVE,2025-01-01,2025-07-19\n' +
               'USR-002,user2@example.com,Jane Smith,SUPPORT_L1,ACTIVE,2025-01-05,2025-07-18\n';
      
      default:
        return 'Data,Value\nSample,Data\n';
    }
  }

  async downloadReport(id: string, userId: string) {
    const report = await this.findOne(id);

    // Check if user has access
    if (report.requestedBy !== userId) {
      throw new NotFoundException('Report not found');
    }

    if (report.status !== ReportStatus.COMPLETED) {
      throw new NotFoundException('Report is not ready for download');
    }

    // Return mock CSV data
    return {
      data: this.generateMockData(report.type),
      fileName: report.fileName,
      contentType: 'text/csv',
    };
  }
}
