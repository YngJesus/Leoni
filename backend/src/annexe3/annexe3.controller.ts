import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { Annexe3Service } from './annexe3.service';
import { CreateAnnexe3CardDto } from './dto/create-annexe3-card.dto';
import { UpdateAnnexe3CardDto } from './dto/update-annexe3-card.dto';
import { ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/enums/user-role.enum';

@Controller('annexe3')
@UseGuards(JwtAuthGuard)
export class Annexe3Controller {
  constructor(private readonly annexe3Service: Annexe3Service) {}

  @Post()
  create(
    @Body() createAnnexe3Dto: CreateAnnexe3CardDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.annexe3Service.create(
      createAnnexe3Dto,
      user.matricule,
      user.nomComplet,
    );
  }

  @Get()
  findAll() {
    return this.annexe3Service.findAll();
  }

  @Get('mine')
  findMine(@CurrentUser() user: JwtPayload) {
    return this.annexe3Service.findMine(user.matricule);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.annexe3Service.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Update an Annexe 3 card by ID' })
  async update(@Param('id') id: string, @Body() dto: UpdateAnnexe3CardDto) {
    return await this.annexe3Service.update(id, dto);
  }

  @Patch(':id/approval')
  approve(
    @Param('id') id: string,
    @Body() body: { status: 'APPROVED' | 'REJECTED' },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.annexe3Service.approve(id, user.matricule, body.status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an Annexe 3 card by ID' })
  async remove(@Param('id') id: string) {
    return await this.annexe3Service.remove(id);
  }
}
