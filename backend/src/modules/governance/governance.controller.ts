import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { GovernanceService } from './governance.service';
import { Recipient } from 'src/schemas/Recipient.schema';
import { DonationDto, RecipientDto, GetRecipientsQuery, GetDonationsQuery } from './governance.dto';
import { Web3Service } from '../web3/web3.service';
import { JwtAuthGuard } from 'src/common/guards/jwt.auth.guard';
import { Donation } from 'src/schemas/Donation.schema';

@Controller('governance')
export class GovernanceController {
  constructor(private readonly governanceService: GovernanceService, private readonly web3Service: Web3Service) {}

  @Get('recipients')
  async getRecipients(@Query() query: GetRecipientsQuery) {
    // If any pagination or search parameters are provided, use the new method
    if (query.page || query.limit || query.search || query.type || query.category) {
      return this.governanceService.getRecipientsWithPagination(query);
    }

    // Otherwise, maintain backward compatibility with the old method
    if (query.creator) {
      return this.governanceService.getRecipientsByCreator(query.creator);
    } else {
      return this.governanceService.getAllRecipients();
    }
  }

  @Get('recipients/:id')
  async getRecipientById(@Param('id') id: string): Promise<Recipient> {
    return this.governanceService.getRecipient(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('recipients')
  async createRecipient(@Body() recipient: RecipientDto, @Request() request: Request): Promise<Recipient> {
    const creator = request['user'];
    const verified = await this.web3Service.verifyRecipient(recipient.id, creator, recipient.donationAddress);
    if (!verified) {
      throw new ForbiddenException('Recipient not found on chain');
    } else {
      return this.governanceService.createRecipient({ ...recipient, creator, verified: false });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('recipients/:id')
  async updateRecipient(
    @Param('id') id: string,
    @Body() recipient: RecipientDto,
    @Request() request: Request,
  ): Promise<Recipient> {
    const creator = request['user'];
    const verified = await this.web3Service.verifyRecipient(recipient.id, creator, recipient.donationAddress);
    if (!verified) {
      throw new ForbiddenException('Recipient not found on chain');
    } else {
      return this.governanceService.updateRecipient(id, { ...recipient, creator, verified: false });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('recipients/:id')
  async deleteRecipient(@Param('id') id: string, @Request() request: Request): Promise<void> {
    const user = request['user'];
    const verified = await this.web3Service.verifyRecipient(id, user.creator, user.donationAddress);
    if (!verified) {
      throw new ForbiddenException('Recipient not found on chain');
    } else {
      await this.governanceService.deleteRecipient(id);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('donations')
  async createDonation(@Body() donation: DonationDto, @Request() request: Request): Promise<Donation> {
    const creator = request['user'];
    const recipient = await this.governanceService.getRecipient(donation.recipientId);
    if (!recipient) {
      throw new ForbiddenException('Recipient not found');
    }
    const verified = await this.web3Service.verifyDonation(donation.id, creator, recipient.donationAddress);
    if (!verified) {
      throw new ForbiddenException('Donation not found on chain');
    } else {
      return this.governanceService.createDonation(creator, donation);
    }
  }

  @Get('donations/:id')
  async getDonationById(@Param('id') id: string): Promise<Donation> {
    return this.governanceService.getDonation(id);
  }

  @Get('donations')
  async getDonations(@Query() query: GetDonationsQuery) {
    try {
      console.log('getDonations endpoint called with query:', query);

      // If any pagination or search parameters are provided, use the new method
      if (query.page || query.limit || query.search !== undefined || query.recipientType || query.status) {
        console.log('Using pagination method');
        return await this.governanceService.getDonationsWithPagination(query);
      }

      // Otherwise, maintain backward compatibility with the old method
      if (query.creator) {
        console.log('Using creator filter method');
        return await this.governanceService.getDonationsByCreator(query.creator);
      } else {
        console.log('Using get all method');
        return await this.governanceService.getAllDonations();
      }
    } catch (error) {
      console.error('Error in getDonations controller:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('donations/:id')
  async updateDonation(
    @Param('id') id: string,
    @Body() donation: Partial<DonationDto>,
    @Request() request: Request,
  ): Promise<Donation> {
    const creator = request['user'];
    const existingDonation = await this.governanceService.getDonationByIdField(id);
    if (!existingDonation) {
      throw new ForbiddenException('Donation not found');
    }
    if (existingDonation.creator !== creator) {
      throw new ForbiddenException('You can only update your own donations');
    }
    return this.governanceService.updateDonation(id, donation);
  }
}
