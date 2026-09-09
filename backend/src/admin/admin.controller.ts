import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateOEMDto } from './dto/create-oem.dto';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateOEMDto } from './dto/update-oem.dto';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ==========================================
  // SITE ENDPOINTS
  // ==========================================

  @Post('sites')
  @ApiOperation({ summary: 'Create a new manufacturing Site' })
  createSite(@Body() dto: CreateSiteDto) {
    return this.adminService.createSite(dto);
  }

  @Get('sites')
  @ApiOperation({ summary: 'Get all Sites with their nested OEMs' })
  findAllSites() {
    return this.adminService.findAllSites();
  }

  @Get('sites/:id')
  @ApiOperation({ summary: 'Get a specific Site by ID' })
  findOneSite(@Param('id') id: string) {
    return this.adminService.findOneSite(id);
  }

  @Patch('sites/:id')
  @ApiOperation({ summary: 'Update a Site' })
  updateSite(@Param('id') id: string, @Body() dto: Partial<CreateSiteDto>) {
    return this.adminService.updateSite(id, dto);
  }

  @Delete('sites/:id')
  @ApiOperation({ summary: 'Delete a Site' })
  deleteSite(@Param('id') id: string) {
    return this.adminService.deleteSite(id);
  }

  // ==========================================
  // OEM ENDPOINTS (NESTED UNDER SITES)
  // ==========================================

  @Post('oems')
  @ApiOperation({ summary: 'Create a new OEM assigned to a specific Site' })
  createOEM(@Body() dto: CreateOEMDto) {
    return this.adminService.createOEM(dto);
  }

  @Patch('oems/:id')
  @ApiOperation({
    summary: 'Update an OEM and optionally move it to another Site',
  })
  updateOEM(@Param('id') id: string, @Body() dto: UpdateOEMDto) {
    return this.adminService.updateOEM(id, dto);
  }

  @Get('sites/:siteId/oems')
  @ApiOperation({ summary: 'Get all OEMs belonging to a specific Site' })
  findOEMsBySite(@Param('siteId') siteId: string) {
    return this.adminService.findOEMsBySite(siteId);
  }

  @Delete('oems/:id')
  @ApiOperation({ summary: 'Delete an OEM' })
  deleteOEM(@Param('id') id: string) {
    return this.adminService.deleteOEM(id);
  }
}
