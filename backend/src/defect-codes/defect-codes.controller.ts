import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DefectCodesService } from './defect-codes.service';
import { DefectCode } from './entities/defect-code.entity';

@ApiTags('Defect Codes (PI3039)')
@Controller('defect-codes')
export class DefectCodesController {
  constructor(private readonly service: DefectCodesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all defect codes or search by term' })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Search term for code or text',
  })
  async getCodes(@Query('q') query?: string): Promise<DefectCode[]> {
    if (query && query.trim().length > 0) {
      return await this.service.search(query);
    }
    return await this.service.findAll();
  }
}
