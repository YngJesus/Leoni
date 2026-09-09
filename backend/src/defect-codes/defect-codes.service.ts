import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { DefectCode } from './entities/defect-code.entity';
import * as catalogData from './data/pi3039-defects.json';
@Injectable()
export class DefectCodesService implements OnModuleInit {
  private readonly logger = new Logger(DefectCodesService.name);

  constructor(
    @InjectRepository(DefectCode)
    private readonly repo: Repository<DefectCode>,
  ) {}

  async onModuleInit() {
    const count = await this.repo.count();
    if (count === 0) {
      this.logger.log('Seeding PI3039 failure catalogue into database...');

      // Transform nested JSON categories/defects into flat entity rows
      const flatDefects = catalogData.categories.flatMap((category) =>
        category.defects.map((defect) => ({
          code: defect.code,
          category: `${category.code}.. ${category.name.fr}`,
          descriptionDe: defect.de,
          descriptionEn: defect.en,
          descriptionFr: defect.fr,
        })),
      );

      await this.repo.save(flatDefects);
      this.logger.log(
        `Successfully seeded ${flatDefects.length} defect codes.`,
      );
    }
  }

  async findAll(): Promise<DefectCode[]> {
    return await this.repo.find({ order: { code: 'ASC' } });
  }

  async search(term: string): Promise<DefectCode[]> {
    const cleanTerm = term.trim();
    return await this.repo.find({
      where: [
        { code: ILike(`%${cleanTerm}%`) },
        { descriptionFr: ILike(`%${cleanTerm}%`) },
        { descriptionEn: ILike(`%${cleanTerm}%`) },
      ],
      order: { code: 'ASC' },
      take: 20,
    });
  }
}
