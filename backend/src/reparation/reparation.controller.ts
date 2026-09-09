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
import { CreateReparationCardDto } from './dto/create-reparation-card.dto';
import { UpdateReparationCardDto } from './dto/update-reparation-card.dto';
import { ReparationService } from './reparation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('Reparation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reparation-cards')
export class ReparationController {
  constructor(private readonly reparationService: ReparationService) {}

  @Post()
  @Roles(UserRole.PRODUCTION, UserRole.ADMIN)
  @ApiOperation({ summary: 'Submit a new defect registration card (Page 1)' })
  createCard(
    @Body() dto: CreateReparationCardDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.reparationService.createCard(dto, user.matricule);
  }

  @Get('mine')
  @Roles(UserRole.PRODUCTION, UserRole.PE, UserRole.QM, UserRole.ADMIN)
  findMine(@CurrentUser() user: JwtPayload) {
    return this.reparationService.findMine(user.matricule);
  }

  @Get()
  @Roles(UserRole.PRODUCTION, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all defect registration cards' })
  findAllCards() {
    return this.reparationService.findAllCards();
  }

  @Get(':id')
  @Roles(UserRole.PRODUCTION, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get defect registration card details' })
  findOneCard(@Param('id') id: string) {
    return this.reparationService.findOneCard(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: update a defect registration card' })
  updateCard(@Param('id') id: string, @Body() dto: UpdateReparationCardDto) {
    return this.reparationService.updateCard(id, dto);
  }
}
