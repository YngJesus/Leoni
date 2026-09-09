import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOEMDto } from './dto/create-oem.dto';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateOEMDto } from './dto/update-oem.dto';
import { ClientOEM } from './entities/client-oem.entity';
import { Site } from './entities/site.entity';

@Injectable()
export class AdminService implements OnModuleInit {
  constructor(
    @InjectRepository(Site)
    private readonly siteRepo: Repository<Site>,
    @InjectRepository(ClientOEM)
    private readonly oemRepo: Repository<ClientOEM>,
  ) {}

  async onModuleInit(): Promise<void> {
    if ((await this.siteRepo.count()) > 0) return;

    const defaults = [
      {
        site: 'Sousse 1 (LT4)',
        oems: ['BMW U11', 'OEM SUPP', 'Cutting central WTNST'],
      },
      {
        site: 'Sousse 2 (LT3)',
        oems: [
          'VW',
          'MB',
          'BMW - HV-NAX',
          'Cutting central WTNSO',
          'MEB-AUTARK',
        ],
      },
      {
        site: 'Sidi Bouali',
        oems: ['RBA', 'Cutting central WTNSB'],
      },
      {
        site: 'Menzel Hayet',
        oems: ['MH', 'Cutting central WTNMH'],
      },
      { site: 'Mateur Nord', oems: ['MN'] },
      { site: 'Mateur Sud', oems: ['MS'] },
    ];

    for (const defaultSite of defaults) {
      const site = await this.siteRepo.save(
        this.siteRepo.create({ name: defaultSite.site, isActive: true }),
      );
      await this.oemRepo.save(
        defaultSite.oems.map((name) =>
          this.oemRepo.create({ name, isActive: true, site }),
        ),
      );
    }
  }

  // ==========================================
  // SITE METHODS
  // ==========================================

  async createSite(dto: CreateSiteDto): Promise<Site> {
    const site = this.siteRepo.create(dto);
    return await this.siteRepo.save(site);
  }

  async findAllSites(): Promise<Site[]> {
    return await this.siteRepo.find({
      relations: {
        oems: true,
      },
    });
  }

  async findOneSite(id: string): Promise<Site> {
    const site = await this.siteRepo.findOne({
      where: { id },
      relations: {
        oems: true,
      },
    });
    if (!site) throw new NotFoundException(`Site with ID ${id} not found`);
    return site;
  }

  async updateSite(id: string, dto: Partial<CreateSiteDto>): Promise<Site> {
    const site = await this.siteRepo.preload({ id, ...dto });
    if (!site) throw new NotFoundException(`Site with ID ${id} not found`);
    return await this.siteRepo.save(site);
  }

  async deleteSite(id: string): Promise<void> {
    const site = await this.siteRepo.findOne({ where: { id } });
    if (!site) throw new NotFoundException(`Site with ID ${id} not found`);

    await this.oemRepo.delete({ site: { id } });
    await this.siteRepo.remove(site);
  }

  // ==========================================
  // OEM METHODS
  // ==========================================

  async createOEM(dto: CreateOEMDto): Promise<ClientOEM> {
    const site = await this.siteRepo.findOne({ where: { id: dto.siteId } });
    if (!site)
      throw new NotFoundException(`Site with ID ${dto.siteId} not found`);

    const oem = this.oemRepo.create({
      name: dto.name,
      isActive: dto.isActive,
      site,
    });
    return await this.oemRepo.save(oem);
  }

  async findOEMsBySite(siteId: string): Promise<ClientOEM[]> {
    return await this.oemRepo.find({
      where: { site: { id: siteId } },
    });
  }

  async updateOEM(id: string, dto: UpdateOEMDto): Promise<ClientOEM> {
    const oem = await this.oemRepo.findOne({ where: { id } });
    if (!oem) throw new NotFoundException(`OEM with ID ${id} not found`);

    if (dto.siteId) {
      const site = await this.siteRepo.findOne({ where: { id: dto.siteId } });
      if (!site)
        throw new NotFoundException(`Site with ID ${dto.siteId} not found`);
      oem.site = site;
    }

    if (dto.name !== undefined) oem.name = dto.name;
    if (dto.isActive !== undefined) oem.isActive = dto.isActive;
    return await this.oemRepo.save(oem);
  }

  async deleteOEM(id: string): Promise<void> {
    const oem = await this.oemRepo.findOne({ where: { id } });
    if (!oem) throw new NotFoundException(`OEM with ID ${id} not found`);
    await this.oemRepo.remove(oem);
  }
}
