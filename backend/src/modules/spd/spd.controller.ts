import { Controller, Get, Post, Body, Param, UseGuards, Request, Query, Put } from '@nestjs/common';
import { SpdService } from './spd.service';
import { JwtAuthGuard } from 'src/common/guards/jwt.auth.guard';
import { SpdDto } from './spd.dto';
import { Spd } from 'src/schemas/Spd.schema';
import { Public } from 'src/common/guards/jwt.auth.guard';

@Controller('spds')
export class SpdController {
  constructor(private readonly spdService: SpdService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createSpd(@Body() spd: SpdDto, @Request() request: Request): Promise<Spd> {
    const creator = request['user'];
    return await this.spdService.createSpd({ ...spd, creator });
  }

  @Get()
  @Public()
  async getSpds(
    @Query('donation') donationId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('category') category?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ): Promise<any> {
    // donation 精确查找保持兼容
    if (donationId) {
      const spd = await this.spdService.getSpdByDonationId(donationId);
      return { items: spd ? [spd] : [], total: spd ? 1 : 0, page: 0, pageSize: spd ? 1 : 0 };
    }

    const pageNum = Number(page);
    const pageSizeNum = Number(pageSize);
    // 默认每页 12（桌面端），移动端前端会传 6
    const safePage = Number.isFinite(pageNum) && pageNum >= 0 ? pageNum : 0;
    const safePageSize = Number.isFinite(pageSizeNum) && pageSizeNum > 0 ? pageSizeNum : 12;
    return await this.spdService.getSpdsPaged(safePage, safePageSize, category, sortBy, sortOrder);
  }

  @Get(':id')
  @Public()
  async getSpd(@Param('id') id: string): Promise<Spd> {
    console.log('aaa Getting SPD with id:', id);
    return await this.spdService.getSpd(id);
  }

  @Get('creator/:creator')
  @Public()
  async getSpdsByCreator(@Param('creator') creator: string): Promise<Spd[]> {
    return await this.spdService.getSpdsByCreator(creator);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateSpd(
    @Param('id') id: string,
    @Body() updateData: Partial<SpdDto>,
    @Request() request: Request,
  ): Promise<Spd> {
    const updatingUser = request['user'];
    return await this.spdService.updateSpd(id, updateData, updatingUser);
  }
}
