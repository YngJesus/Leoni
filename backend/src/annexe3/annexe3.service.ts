import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTriagePlanDto } from '../triage-plan/dto/create-triage-plan.dto';
import { CreateAnnexe3CardDto } from './dto/create-annexe3-card.dto';
import { UpdateAnnexe3CardDto } from './dto/update-annexe3-card.dto';
import { Annexe3Card } from './entities/annexe3-card.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class Annexe3Service {
  constructor(
    @InjectRepository(Annexe3Card)
    private readonly annexe3Repo: Repository<Annexe3Card>,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Create Annexe 3 Card with formatted incrementing Card No & Defect Rate
   */
  async create(
    dto: CreateAnnexe3CardDto,
    createdByMatricule?: string,
    senderName?: string,
  ): Promise<Annexe3Card> {
    const defectRate =
      dto.controlledQuantity > 0
        ? Number(
            ((dto.defectiveQuantity / dto.controlledQuantity) * 100).toFixed(1),
          )
        : 0;

    const totalAllocatedTimeMin =
      dto.correctiveActions?.reduce(
        (sum, item) => sum + (item.elapsedTimeMin || 0),
        0,
      ) || 0;

    const tempCard = this.annexe3Repo.create({
      ...dto,
      date: new Date(dto.date),
      manufacturingDate: dto.manufacturingDate
        ? new Date(dto.manufacturingDate)
        : undefined,
      defectRate,
      totalAllocatedTimeMin,
      createdByMatricule,
      cardNo: 'TEMP',
    } as Partial<Annexe3Card>);

    const savedCard = await this.annexe3Repo.save(tempCard);

    const prefix = dto.productionProcess.toUpperCase();
    const formattedNo = `CARD-${prefix}-${String(savedCard.sequenceNumber).padStart(4, '0')}`;

    savedCard.cardNo = formattedNo;
    const result = await this.annexe3Repo.save(savedCard);
    const recipients = [
      result.assignedProductionLeaderMatricule,
      result.assignedQualityReviewerMatricule,
    ].filter((matricule): matricule is string => Boolean(matricule));
    await Promise.all(
      recipients.map((recipientMatricule) =>
        this.notificationsService.create({
          recipientMatricule,
          senderMatricule: result.createdByMatricule,
          senderName,
          type: 'APPROVAL_REQUEST',
          entityType: 'ANNEXE3',
          entityId: result.id,
          message: `Une carte Annexe 3 (${result.cardNo}) attend votre approbation.`,
        }),
      ),
    );
    return result;
  }

  async findAll(): Promise<Annexe3Card[]> {
    return await this.annexe3Repo.find({
      relations: {
        riskActions: true,
        correctiveActions: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findMine(matricule: string): Promise<Annexe3Card[]> {
    return this.annexe3Repo.find({
      where: [
        { createdByMatricule: matricule },
        { assignedProductionLeaderMatricule: matricule },
        { assignedQualityReviewerMatricule: matricule },
      ],
      relations: { riskActions: true, correctiveActions: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Annexe3Card> {
    const card = await this.annexe3Repo.findOne({
      where: { id },
      relations: {
        riskActions: true,
        correctiveActions: true,
      },
    });

    if (!card) {
      throw new NotFoundException(`Annexe 3 Card with ID "${id}" not found`);
    }

    return card;
  }

  /**
   * Update an existing Annexe 3 Card
   */
  async update(id: string, dto: UpdateAnnexe3CardDto): Promise<Annexe3Card> {
    const card = await this.findOne(id);

    // Merge basic property updates
    Object.assign(card, dto);

    if (dto.date) {
      card.date = new Date(dto.date);
    }
    if (dto.manufacturingDate) {
      card.manufacturingDate = new Date(dto.manufacturingDate);
    }

    // Recalculate Defect Rate if quantities changed
    const controlledQty = dto.controlledQuantity ?? card.controlledQuantity;
    const defectiveQty = dto.defectiveQuantity ?? card.defectiveQuantity;

    card.defectRate =
      controlledQty > 0
        ? Number(((defectiveQty / controlledQty) * 100).toFixed(1))
        : 0;

    // Recalculate Total Time if corrective actions updated
    if (dto.correctiveActions) {
      card.totalAllocatedTimeMin = dto.correctiveActions.reduce(
        (sum, item) => sum + (item.elapsedTimeMin || 0),
        0,
      );
    }

    return await this.annexe3Repo.save(card);
  }

  async approve(
    id: string,
    matricule: string,
    status: 'APPROVED' | 'REJECTED',
  ) {
    const card = await this.findOne(id);
    if (
      card.assignedProductionLeaderMatricule !== matricule &&
      card.assignedQualityReviewerMatricule !== matricule
    ) {
      throw new NotFoundException('Cette carte ne vous est pas assignée.');
    }
    card.status = status;
    return this.annexe3Repo.save(card);
  }

  /**
   * Remove an Annexe 3 Card by ID
   */
  async remove(id: string): Promise<{ message: string }> {
    const card = await this.findOne(id);
    await this.annexe3Repo.remove(card);
    return { message: `Annexe 3 Card with ID "${id}" deleted successfully.` };
  }

  /**
   * Get pre-filled Annexe 2 payload to avoid double typing
   */
  async generateAnnexe2Payload(
    annexe3Id: string,
  ): Promise<Partial<CreateTriagePlanDto>> {
    const card = await this.findOne(annexe3Id);

    return {
      date: new Date(card.date).toISOString(),
      numOrdre: card.cardNo,
      numSerie: card.itemCode || card.refIndex || 'SN-AUTOFILLED',
      quantiteBloquee: card.quantityToBeControlled,
      numFicheRetouche: `FR-${card.cardNo}`,
      motifBlocage: `${card.defectCode} - ${card.defectDescription}`,
      quantiteConforme: card.controlledQuantity - card.defectiveQuantity,
      quantiteNonConforme: card.defectiveQuantity,
      assignedQmMatricule: card.assignedQualityReviewerMatricule || '',
      assignedPeMatricule: '',
      decision: 'Réparer et / ou Retoucher',
      justificationDecision: card.ncDescription || 'Transféré depuis Annexe 3',
      criteresTriage: [
        {
          critere: `Contrôle défaut: ${card.defectDescription}`,
          reperageCablagesCaisse: card.segmentLine,
          matriculeExecuteur: card.responsiblePerson,
          tempsPrevu: `${card.totalAllocatedTimeMin} mins`,
        },
      ],
    };
  }
}
