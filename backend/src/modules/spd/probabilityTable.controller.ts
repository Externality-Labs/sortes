import { Controller, Get, Param } from '@nestjs/common';
import { SpdService } from './spd.service';
import { ProbabilityTable } from 'src/schemas/ProbabilityTable.schema';
import { Public } from 'src/common/guards/jwt.auth.guard';

@Public()
@Controller('probability-tables')
export class ProbabilityTableController {
  constructor(private readonly spdService: SpdService) {}

  @Get('')
  async getProbabilityTables(): Promise<ProbabilityTable[]> {
    return await this.spdService.getProbabilityTables();
  }

  @Get('/:id')
  async getProbabilityTable(@Param('id') id: string): Promise<ProbabilityTable> {
    return await this.spdService.getProbabilityTable(id);
  }
}
