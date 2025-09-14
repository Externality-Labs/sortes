import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Spd } from 'src/schemas/Spd.schema';
import { ProbabilityTable } from 'src/schemas/ProbabilityTable.schema';
import { Donation } from 'src/schemas/Donation.schema';

@Injectable()
export class SpdService {
  constructor(
    @InjectModel(Spd.name) private spdModel: Model<Spd>,
    @InjectModel(ProbabilityTable.name) private probabilityTableModel: Model<ProbabilityTable>,
    @InjectModel(Donation.name) private donationModel: Model<Donation>,
  ) {}

  async createSpd(spd: Spd): Promise<Spd> {
    try {
      console.log('Creating SPD with data:', spd);

      const existingProbabilityTable = await this.probabilityTableModel.findOne({ id: spd.probabilityTableId });
      console.log('Found probability table:', existingProbabilityTable);
      if (!existingProbabilityTable) {
        throw new BadRequestException(`Probability table not found with id: ${spd.probabilityTableId}`);
      }

      const existingDonation = await this.donationModel.findOne({ id: spd.donationId });
      console.log('Found donation:', existingDonation);
      if (!existingDonation) {
        // 检查数据库中是否有任何捐赠记录
        const allDonations = await this.donationModel.find().limit(5);
        console.log('Sample donations in database:', allDonations);
        throw new BadRequestException(`Donation not found with id: ${spd.donationId}`);
      }

      const existingSpd = await this.spdModel.findOne({ donationId: spd.donationId });
      console.log('Existing SPD:', existingSpd);
      if (existingSpd) {
        throw new BadRequestException('donation already has an spd bound');
      }

      if (existingDonation.creator !== spd.creator) {
        throw new UnauthorizedException(
          `donation creator (${existingDonation.creator}) does not match spd creator (${spd.creator})`,
        );
      }

      const createdSpd = await this.spdModel.create(spd);
      console.log('Successfully created SPD:', createdSpd);
      return createdSpd;
    } catch (error) {
      console.error('Error creating SPD:', error);
      throw error;
    }
  }

  async getSpd(id: string): Promise<Spd> {
    console.log('Getting SPD with id:', id);
    return await this.spdModel.findById(id);
  }

  async getSpds(): Promise<Spd[]> {
    return await this.spdModel.find();
  }

  async getSpdsPaged(
    page: number,
    pageSize: number,
    category?: string,
    sortBy?: string,
    sortOrder?: string,
  ): Promise<{
    items: Spd[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const safePage = Number.isFinite(page) && page >= 0 ? page : 0;
    const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 12;

    if (category && category !== 'All') {
      // If category is specified, we need to join with Donation and Recipient to filter by category
      const pipeline: any[] = [
        {
          $lookup: {
            from: 'donations',
            localField: 'donationId',
            foreignField: 'id',
            as: 'donation',
          },
        },
        {
          $unwind: '$donation',
        },
        {
          $lookup: {
            from: 'recipients',
            localField: 'donation.recipientId',
            foreignField: 'id',
            as: 'recipient',
          },
        },
        {
          $unwind: '$recipient',
        },
        {
          $match: {
            'recipient.category': category,
          },
        },
      ];

      // Apply sorting before pagination
      if (sortBy && sortOrder) {
        const sortDirection = sortOrder === 'asc' ? 1 : -1;
        if (sortBy === 'createdAt') {
          pipeline.push({ $sort: { createdAt: sortDirection } });
        } else if (sortBy === 'name') {
          pipeline.push({ $sort: { name: sortDirection } });
        } else {
          // Default sort if sortBy is not recognized
          pipeline.push({ $sort: { createdAt: -1 } });
        }
      } else {
        // Default sort
        pipeline.push({ $sort: { createdAt: -1 } });
      }

      // Add pagination after sorting
      pipeline.push({ $skip: safePage * safePageSize }, { $limit: safePageSize });

      const countPipeline: any[] = [
        {
          $lookup: {
            from: 'donations',
            localField: 'donationId',
            foreignField: 'id',
            as: 'donation',
          },
        },
        {
          $unwind: '$donation',
        },
        {
          $lookup: {
            from: 'recipients',
            localField: 'donation.recipientId',
            foreignField: 'id',
            as: 'recipient',
          },
        },
        {
          $unwind: '$recipient',
        },
        {
          $match: {
            'recipient.category': category,
          },
        },
        {
          $count: 'total',
        },
      ];

      const [items, totalResult] = await Promise.all([
        this.spdModel.aggregate(pipeline),
        this.spdModel.aggregate(countPipeline),
      ]);

      const total = totalResult.length > 0 ? totalResult[0].total : 0;
      return { items, total, page: safePage, pageSize: safePageSize };
    } else {
      // No category filter, use simple pagination with sorting
      let sortQuery: any = { createdAt: -1 }; // Default sort

      // Apply custom sorting if specified
      if (sortBy && sortOrder) {
        const sortDirection = sortOrder === 'asc' ? 1 : -1;
        if (sortBy === 'createdAt') {
          sortQuery = { createdAt: sortDirection };
        } else if (sortBy === 'name') {
          sortQuery = { name: sortDirection };
        }
        // Add more sort fields as needed
      }

      const [items, total] = await Promise.all([
        this.spdModel
          .find()
          .sort(sortQuery)
          .skip(safePage * safePageSize)
          .limit(safePageSize),
        this.spdModel.countDocuments(),
      ]);
      return { items, total, page: safePage, pageSize: safePageSize };
    }
  }

  async getSpdsByCreator(creator: string): Promise<Spd[]> {
    return await this.spdModel.find({ creator });
  }

  async getSpdByDonationId(donationId: string): Promise<Spd> {
    return await this.spdModel.findOne({ donationId });
  }

  async createProbabilityTable(probabilityTable: ProbabilityTable): Promise<ProbabilityTable> {
    return await this.probabilityTableModel.create(probabilityTable);
  }

  async getProbabilityTable(id: string): Promise<ProbabilityTable> {
    return await this.probabilityTableModel.findOne({ id });
  }

  async getProbabilityTables(): Promise<ProbabilityTable[]> {
    return await this.probabilityTableModel.find();
  }

  async updateSpd(id: string, updateData: Partial<Spd>, updatingUser: string): Promise<Spd> {
    try {
      console.log('Updating SPD with id:', id, 'data:', updateData);

      // 查找要更新的SPD
      const existingSpd = await this.spdModel.findById(id);
      if (!existingSpd) {
        throw new BadRequestException(`SPD not found with id: ${id}`);
      }

      // 检查权限：只有创建者才能更新
      if (existingSpd.creator !== updatingUser) {
        throw new UnauthorizedException(
          `Only the creator can update this SPD. Creator: ${existingSpd.creator}, User: ${updatingUser}`,
        );
      }

      // 如果更新了probabilityTableId，需要验证新的概率表是否存在
      if (updateData.probabilityTableId && updateData.probabilityTableId !== existingSpd.probabilityTableId) {
        const existingProbabilityTable = await this.probabilityTableModel.findOne({
          id: updateData.probabilityTableId,
        });
        if (!existingProbabilityTable) {
          throw new BadRequestException(`Probability table not found with id: ${updateData.probabilityTableId}`);
        }
      }

      // 如果更新了donationId，需要验证新的捐赠是否存在且属于当前用户
      if (updateData.donationId && updateData.donationId !== existingSpd.donationId) {
        const existingDonation = await this.donationModel.findOne({ id: updateData.donationId });
        if (!existingDonation) {
          throw new BadRequestException(`Donation not found with id: ${updateData.donationId}`);
        }
        if (existingDonation.creator !== updatingUser) {
          throw new UnauthorizedException(
            `Donation creator (${existingDonation.creator}) does not match updating user (${updatingUser})`,
          );
        }

        // 检查新的donationId是否已经被其他SPD使用
        const conflictingSpd = await this.spdModel.findOne({
          donationId: updateData.donationId,
          _id: { $ne: id }, // 排除当前SPD
        });
        if (conflictingSpd) {
          throw new BadRequestException('This donation already has an SPD bound');
        }
      }

      // 执行更新
      const updatedSpd = await this.spdModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true }, // 返回更新后的文档
      );

      console.log('Successfully updated SPD:', updatedSpd);
      return updatedSpd;
    } catch (error) {
      console.error('Error updating SPD:', error);
      throw error;
    }
  }
}
