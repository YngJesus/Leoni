import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { UserRole } from '../users/enums/user-role.enum';
import { CreateTriagePlanDto } from './dto/create-triage-plan.dto';
import { UpdateStep3PeDto } from './dto/update-step-3-pe.dto';
import { UpdateStep4QmDto } from './dto/update-step-4-qm.dto';
import { UpdateTriagePlanAdminDto } from './dto/update-triage-plan-admin.dto';
import { TriagePlanService } from './triage-plan.service';

@ApiTags('Triage Plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('triage-plans')
export class TriagePlanController {
  constructor(private readonly triagePlanService: TriagePlanService) {}

  @Post()
  @Roles(UserRole.PRODUCTION, UserRole.ADMIN)
  @ApiOperation({ summary: 'Step 1 & 2 (Production): Create Triage Plan' })
  create(@Body() dto: CreateTriagePlanDto, @CurrentUser() user: JwtPayload) {
    return this.triagePlanService.create(dto, user.matricule, user.nomComplet);
  }

  @Patch(':id/production')
  @Roles(UserRole.PRODUCTION, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Production: update general / triage fields on the same fiche',
  })
  updateProduction(
    @Param('id') id: string,
    @Body() dto: CreateTriagePlanDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.triagePlanService.updateProduction(
      id,
      dto,
      user.matricule,
      user.role,
    );
  }

  @Patch(':id/step-3-pe')
  @Roles(UserRole.PE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Step 3 (PE): Submit rework instructions & risk analysis',
  })
  updateStep3PE(
    @Param('id') id: string,
    @Body() dto: UpdateStep3PeDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.triagePlanService.updateStep3PE(id, dto, user.matricule);
  }

  @Patch(':id/step-4-qm')
  @Roles(UserRole.QM, UserRole.ADMIN)
  @ApiOperation({ summary: 'Step 4 (QM): Submit final quality validation' })
  updateStep4QM(
    @Param('id') id: string,
    @Body() dto: UpdateStep4QmDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.triagePlanService.updateStep4QM(id, dto, user.matricule);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Admin: correct production fields on a triage plan',
  })
  updateAdmin(@Param('id') id: string, @Body() dto: UpdateTriagePlanAdminDto) {
    return this.triagePlanService.updateAdmin(id, dto);
  }

  @Patch(':id/approval')
  @Roles(UserRole.PE, UserRole.QM, UserRole.ADMIN)
  approve(
    @Param('id') id: string,
    @Body() body: { status: 'APPROVED' | 'REJECTED' },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.triagePlanService.approve(id, user.matricule, body.status);
  }

  @Get()
  @ApiOperation({ summary: 'View all triage plans' })
  findAll() {
    return this.triagePlanService.findAll();
  }

  @Get('mine')
  @Roles(UserRole.PRODUCTION, UserRole.PE, UserRole.QM, UserRole.ADMIN)
  findMine(@CurrentUser() user: JwtPayload) {
    return this.triagePlanService.findMine(user.matricule);
  }

  @Get(':id')
  @ApiOperation({ summary: 'View single triage plan details' })
  findOne(@Param('id') id: string) {
    return this.triagePlanService.findOne(id);
  }
}
