import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportsService, CreateReportDto, ReportQuery } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createReportDto: CreateReportDto, @Request() req) {
    return this.reportsService.create(createReportDto, req.user.id);
  }

  @Get()
  async findAll(@Query() query: ReportQuery) {
    return this.reportsService.findAll(query);
  }

  @Get('my-reports')
  async getMyReports(@Request() req, @Query() query: ReportQuery) {
    return this.reportsService.getUserReports(req.user.id, query);
  }

  @Get('stats')
  async getStats(@Request() req, @Query('userId') userId?: string) {
    // Users can only see their own stats unless they're admin
    const targetUserId = req.user.role === 'ADMIN' ? userId : req.user.id;
    return this.reportsService.getReportStats(targetUserId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const report = await this.reportsService.findOne(id);
    
    // Users can only see their own reports unless they're admin
    if (req.user.role !== 'ADMIN' && report.requestedBy !== req.user.id) {
      throw new Error('Report not found');
    }
    
    return report;
  }

  @Get(':id/download')
  async downloadReport(@Param('id') id: string, @Request() req, @Res() res: Response) {
    const result = await this.reportsService.downloadReport(id, req.user.id);
    
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
    res.send(result.data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req) {
    return this.reportsService.delete(id, req.user.id);
  }
}
