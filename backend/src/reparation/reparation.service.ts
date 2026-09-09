import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientOEM } from '../admin/entities/client-oem.entity';
import { Site } from '../admin/entities/site.entity';
import { CreateReparationCardDto } from './dto/create-reparation-card.dto';
import { UpdateReparationCardDto } from './dto/update-reparation-card.dto';
import { ReparationCard } from './entities/reparation-card.entity';

@Injectable()
export class ReparationService {
  constructor(
    @InjectRepository(ReparationCard)
    private readonly cardRepo: Repository<ReparationCard>,
    @InjectRepository(Site)
    private readonly siteRepo: Repository<Site>,
    @InjectRepository(ClientOEM)
    private readonly oemRepo: Repository<ClientOEM>,
  ) {}

  async createCard(
    dto: CreateReparationCardDto,
    createdByMatricule?: string,
  ): Promise<ReparationCard> {
    const site = await this.siteRepo.findOne({ where: { id: dto.siteId } });
    if (!site)
      throw new NotFoundException(`Site with ID ${dto.siteId} not found`);

    const clientOem = await this.oemRepo.findOne({
      where: { id: dto.clientOemId },
    });
    if (!clientOem)
      throw new NotFoundException(`OEM with ID ${dto.clientOemId} not found`);

    const card = this.cardRepo.create({
      site,
      clientOem,
      date: dto.date,
      typeReparation: dto.typeReparation,
      defectLines: dto.defectLines,
      createdByMatricule,
    });

    return await this.cardRepo.save(card);
  }

  async findMine(matricule: string): Promise<ReparationCard[]> {
    return this.cardRepo.find({
      where: { createdByMatricule: matricule },
      relations: { site: true, clientOem: true, defectLines: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findAllCards(): Promise<ReparationCard[]> {
    return await this.cardRepo.find({
      relations: {
        site: true,
        clientOem: true,
        defectLines: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneCard(id: string): Promise<ReparationCard> {
    const card = await this.cardRepo.findOne({
      where: { id },
      relations: {
        site: true,
        clientOem: true,
        defectLines: true,
      },
    });
    if (!card) throw new NotFoundException(`Card with ID ${id} not found`);
    return card;
  }

  async updateCard(
    id: string,
    dto: UpdateReparationCardDto,
  ): Promise<ReparationCard> {
    const card = await this.findOneCard(id);
    if (dto.siteId) {
      const site = await this.siteRepo.findOne({ where: { id: dto.siteId } });
      if (!site)
        throw new NotFoundException(`Site with ID ${dto.siteId} not found`);
      card.site = site;
    }
    if (dto.clientOemId) {
      const clientOem = await this.oemRepo.findOne({
        where: { id: dto.clientOemId },
      });
      if (!clientOem)
        throw new NotFoundException(`OEM with ID ${dto.clientOemId} not found`);
      card.clientOem = clientOem;
    }
    if (dto.date) card.date = dto.date;
    if (dto.typeReparation) card.typeReparation = dto.typeReparation;
    if (dto.defectLines)
      card.defectLines = dto.defectLines.map(
        (line) => ({ ...line, card }) as any,
      );
    return await this.cardRepo.save(card);
  }
}
