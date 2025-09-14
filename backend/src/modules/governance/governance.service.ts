import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Web3Service } from '../web3/web3.service';
import { Recipient } from 'src/schemas/Recipient.schema';
import { Donation } from 'src/schemas/Donation.schema';
import { DonationDto, GetRecipientsQuery, GetDonationsQuery } from './governance.dto';
@Injectable()
export class GovernanceService {
  constructor(
    private readonly web3Service: Web3Service,
    @InjectModel(Recipient.name) private recipientModel: Model<Recipient>,
    @InjectModel(Donation.name) private donationModel: Model<Donation>,
  ) {}

  async getRecipientsByCreator(creatorAddress: string): Promise<Recipient[]> {
    return this.recipientModel.find({ creator: creatorAddress });
  }

  async getAllRecipients(): Promise<Recipient[]> {
    return this.recipientModel.find();
  }

  async getRecipientsWithPagination(query: GetRecipientsQuery): Promise<{
    recipients: Recipient[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { creator, page = 1, limit = 20, search, type, category } = query;

    // Build filter object
    const filter: any = {};

    if (creator) {
      filter.creator = creator;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    if (type) {
      filter.type = type;
    }

    if (category) {
      filter.category = category;
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Execute queries
    const [recipients, total] = await Promise.all([
      this.recipientModel
        .find(filter)
        .sort({ _id: -1 }) // Sort by creation time (newest first)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.recipientModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      recipients,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getRecipient(id: string): Promise<Recipient> {
    return this.recipientModel.findOne({ id: id });
  }

  async createRecipient(recipient: Recipient): Promise<Recipient> {
    // check if recipient already exists
    const existingRecipient = await this.recipientModel.findOne({ id: recipient.id });
    if (existingRecipient) {
      throw new BadRequestException('Recipient already exists');
    }
    return this.recipientModel.create(recipient);
  }

  async updateRecipient(id: string, recipient: Recipient): Promise<Recipient> {
    return this.recipientModel.findOneAndUpdate({ id: id }, recipient, { new: true });
  }

  async deleteRecipient(id: string): Promise<void> {
    await this.recipientModel.findOneAndDelete({ id: id });
  }

  async createDonation(creator: string, donation: DonationDto): Promise<Donation> {
    // check if donation already exists
    const existingDonation = await this.donationModel.findOne({ id: donation.id });
    if (existingDonation) {
      throw new BadRequestException('Donation already exists');
    }
    return this.donationModel.create({ ...donation, creator });
  }

  async getDonation(id: string): Promise<Donation> {
    return this.donationModel.findOne({ id });
  }

  async getDonationByIdField(id: string): Promise<Donation> {
    return this.donationModel.findOne({ id });
  }

  async getDonationsByCreator(creator: string): Promise<Donation[]> {
    return this.donationModel.find({ creator });
  }

  async getAllDonations(): Promise<Donation[]> {
    return this.donationModel.find();
  }

  async getDonationsWithPagination(query: GetDonationsQuery): Promise<{
    donations: Donation[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const { creator, page = 1, limit = 20, search, recipientType, status } = query;

      // Ensure page and limit are numbers
      const pageNum = Number(page);
      const limitNum = Number(limit);

      console.log('getDonationsWithPagination called with:', {
        creator,
        page: pageNum,
        limit: limitNum,
        search,
        recipientType,
        status,
      });

      // Build the aggregation pipeline
      const pipeline: any[] = [];

      // Add match stage for creator if provided
      if (creator) {
        pipeline.push({ $match: { creator } });
      }

      // Lookup recipient information
      pipeline.push({
        $lookup: {
          from: 'recipients',
          localField: 'recipientId',
          foreignField: 'id',
          as: 'recipient',
        },
      });

      // Unwind the recipient array (since it's a single object)
      pipeline.push({
        $unwind: {
          path: '$recipient',
          preserveNullAndEmptyArrays: true,
        },
      });

      // Add search filter if provided and not empty
      if (search && search.trim()) {
        pipeline.push({
          $match: {
            'recipient.name': { $regex: search.trim(), $options: 'i' },
          },
        });
      }

      // Add recipient type filter if provided
      if (recipientType) {
        pipeline.push({
          $match: {
            'recipient.type': recipientType,
          },
        });
      }

      console.log('Aggregation pipeline:', JSON.stringify(pipeline, null, 2));

      // Calculate total count
      const totalPipeline = [...pipeline, { $count: 'total' }];
      const totalResult = await this.donationModel.aggregate(totalPipeline).exec();
      const total = totalResult.length > 0 ? totalResult[0].total : 0;

      console.log('Total count result:', total);

      // Add pagination
      const skip = (pageNum - 1) * limitNum;
      pipeline.push({ $sort: { _id: -1 } }); // Sort by creation time (newest first)
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limitNum });

      // Remove the joined recipient data from the result
      pipeline.push({
        $project: {
          recipient: 0,
        },
      });

      console.log('Final pipeline with pagination:', JSON.stringify(pipeline, null, 2));

      const donations = await this.donationModel.aggregate(pipeline).exec();
      const totalPages = Math.ceil(total / limitNum);

      console.log('Query result:', {
        donationsCount: donations.length,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      });

      return {
        donations,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      };
    } catch (error) {
      console.error('Error in getDonationsWithPagination:', error);
      throw new BadRequestException(`Failed to get donations: ${error.message}`);
    }
  }

  async updateDonation(id: string, donation: Partial<DonationDto>): Promise<Donation> {
    const existingDonation = await this.donationModel.findOne({ id });
    if (!existingDonation) {
      throw new BadRequestException('Donation not found');
    }
    return this.donationModel.findOneAndUpdate({ id }, donation, { new: true });
  }
}
