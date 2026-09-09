import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTriagePlanDto } from './dto/create-triage-plan.dto';
import { UpdateStep3PeDto } from './dto/update-step-3-pe.dto';
import { UpdateStep4QmDto } from './dto/update-step-4-qm.dto';
import { UpdateTriagePlanAdminDto } from './dto/update-triage-plan-admin.dto';
import { QualityCheck } from './entities/quality-check.entity';
import { RetouchInstruction } from './entities/retouch-instruction.entity';
import { RiskAnalysis } from './entities/risk-analysis.entity';
import { TriagePlan } from './entities/triage-plan.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TriagePlanService {
  constructor(
    @InjectRepository(TriagePlan)
    private readonly triagePlanRepo: Repository<TriagePlan>,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * STEP 1 & 2: Create plan, criteria, approvers & initial decision
   */
  async create(
    dto: CreateTriagePlanDto,
    userMatricule: string,
    senderName?: string,
  ): Promise<TriagePlan> {
    const plan = this.triagePlanRepo.create({
      ...dto,
      date: new Date(dto.date),
      createdByMatricule: userMatricule,
    } as Partial<TriagePlan>);

    plan.status = 'PENDING';
    const result = await this.triagePlanRepo.save(plan);
    const recipients = [
      result.assignedPeMatricule,
      result.assignedQmMatricule,
    ].filter((matricule): matricule is string => Boolean(matricule));
    await Promise.all(
      recipients.map((recipientMatricule) =>
        this.notificationsService.create({
          recipientMatricule,
          senderMatricule: result.createdByMatricule,
          senderName,
          type: 'APPROVAL_REQUEST',
          entityType: 'TRIAGE_PLAN',
          entityId: result.id,
          message: `Le plan ${result.numFicheRetouche} vous est assigné. Chaque rôle complète ses champs sur la même fiche.`,
        }),
      ),
    );
    return this.findOne(result.id);
  }

  /**
   * STEP 3: PE Retouch Plan (Disabled if decision is REBUTER)
   */
  async updateStep3PE(
    id: string,
    dto: UpdateStep3PeDto,
    peMatricule: string,
  ): Promise<TriagePlan> {
    const plan = await this.triagePlanRepo.findOne({
      where: { id },
      relations: {
        criteresTriage: true,
        instructionsRetouche: true,
        pointsControle: true,
        analysesRisques: true,
      },
    });

    if (!plan) {
      throw new NotFoundException(`Triage plan with ID "${id}" not found`);
    }

    // Business Rule Check: Disable Step 3 if REBUTER (SCRAP) was selected in Step 2
    if (plan.decision === 'REBUTER (SCRAP)') {
      throw new BadRequestException(
        'Step 3 (Plan de Retouche PE) is disabled because the decision is REBUTER (SCRAP).',
      );
    }

    plan.instructionsRetouche = (dto.instructionsRetouche || []).map(
      (instruction) =>
        this.triagePlanRepo.manager.create(RetouchInstruction, {
          ...instruction,
          triagePlan: plan,
        }),
    );
    plan.productionEngineeringMatricule = peMatricule;
    if (plan.status === 'PENDING') {
      plan.status = 'PE_COMPLETED';
    }

    await this.triagePlanRepo.save(plan);
    return this.findOne(id);
  }

  /**
   * STEP 4: QM Quality Control & Final Validation
   */
  async updateStep4QM(
    id: string,
    dto: UpdateStep4QmDto,
    qmMatricule: string,
  ): Promise<TriagePlan> {
    const plan = await this.triagePlanRepo.findOne({
      where: { id },
      relations: {
        criteresTriage: true,
        instructionsRetouche: true,
        pointsControle: true,
        analysesRisques: true,
      },
    });

    if (!plan) {
      throw new NotFoundException(`Triage plan with ID "${id}" not found`);
    }

    // Clear risks if toggle is explicitly set to false
    if (dto.hasPotentialRisks === false) {
      dto.analysesRisques = [];
    }

    if (dto.pointsControle) {
      plan.pointsControle = dto.pointsControle.map((point) =>
        this.triagePlanRepo.manager.create(QualityCheck, {
          ...point,
          triagePlan: plan,
        }),
      );
    }
    if (dto.hasPotentialRisks !== undefined) {
      plan.hasPotentialRisks = dto.hasPotentialRisks;
    }
    if (dto.analysesRisques) {
      plan.analysesRisques = dto.analysesRisques.map((risk) =>
        this.triagePlanRepo.manager.create(RiskAnalysis, {
          ...risk,
          triagePlan: plan,
        }),
      );
    }
    plan.qmMatriculeValidation = dto.qmMatriculeValidation;
    plan.qualiteQmMatricule = qmMatricule;
    plan.status = 'COMPLETED';

    await this.triagePlanRepo.save(plan);
    return this.findOne(id);
  }

  async updateProduction(
    id: string,
    dto: CreateTriagePlanDto,
    matricule: string,
    role: string,
  ): Promise<TriagePlan> {
    const plan = await this.findOne(id);
    if (
      role !== 'ADMIN' &&
      plan.createdByMatricule &&
      plan.createdByMatricule !== matricule
    ) {
      throw new ForbiddenException(
        'Seul le créateur de cette fiche peut modifier la partie Production.',
      );
    }

    Object.assign(plan, {
      ...dto,
      date: new Date(dto.date),
    });
    await this.triagePlanRepo.save(plan);
    return this.findOne(id);
  }

  async updateAdmin(
    id: string,
    dto: UpdateTriagePlanAdminDto,
  ): Promise<TriagePlan> {
    const plan = await this.triagePlanRepo.findOne({
      where: { id },
      relations: {
        criteresTriage: true,
        instructionsRetouche: true,
        pointsControle: true,
        analysesRisques: true,
      },
    });
    if (!plan) {
      throw new NotFoundException(`Triage plan with ID "${id}" not found`);
    }

    Object.assign(plan, dto);
    await this.triagePlanRepo.save(plan);
    return this.findOne(id);
  }

  async approve(
    id: string,
    matricule: string,
    status: 'APPROVED' | 'REJECTED',
  ) {
    const plan = await this.triagePlanRepo.findOne({ where: { id } });
    if (
      !plan ||
      (plan.assignedPeMatricule !== matricule &&
        plan.assignedQmMatricule !== matricule)
    ) {
      throw new NotFoundException('Ce plan ne vous est pas assigné.');
    }
    plan.status = status;
    return this.triagePlanRepo.save(plan);
  }

  /**
   * Fetch all plans with all relations
   */
  async findAll(): Promise<TriagePlan[]> {
    return await this.triagePlanRepo.find({
      relations: {
        criteresTriage: true,
        instructionsRetouche: true,
        pointsControle: true,
        analysesRisques: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findMine(matricule: string): Promise<TriagePlan[]> {
    return this.triagePlanRepo.find({
      where: [
        { createdByMatricule: matricule },
        { assignedPeMatricule: matricule },
        { assignedQmMatricule: matricule },
      ],
      relations: {
        criteresTriage: true,
        instructionsRetouche: true,
        pointsControle: true,
        analysesRisques: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Fetch single plan with all relations
   */
  async findOne(id: string): Promise<TriagePlan> {
    const plan = await this.triagePlanRepo.findOne({
      where: { id },
      relations: {
        criteresTriage: true,
        instructionsRetouche: true,
        pointsControle: true,
        analysesRisques: true,
      },
    });

    if (!plan) {
      throw new NotFoundException(`Triage plan with ID "${id}" not found`);
    }

    return plan;
  }
}
