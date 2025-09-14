import {
  IsEnum,
  IsEthereumAddress,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { IsNotEmpty } from 'class-validator';
import { RecipientType, RecipientCategory } from 'src/schemas/Recipient.schema';
import { Type } from 'class-transformer';

export class RecipientDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  @IsEthereumAddress()
  donationAddress: string;

  @IsString()
  @Length(1, 50)
  name: string;

  @IsString()
  @ValidateIf((o) => o.website !== 'N/A')
  @IsUrl()
  website: string;

  @IsNotEmpty()
  @IsString()
  @ValidateIf((o) => o.twitter !== 'N/A')
  @IsUrl()
  twitter: string;

  @IsString()
  @Length(1, 1000)
  introduction: string;

  @IsEnum(RecipientType)
  type: RecipientType;

  @IsEnum(RecipientCategory)
  category: RecipientCategory;
}

export class DonationDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsString()
  @Length(1, 1000)
  purpose: string;

  @IsNumber()
  @Min(360)
  @Max(20000)
  donationAmount: number;

  @IsNotEmpty()
  @IsString()
  recipientId: string;

  @IsNotEmpty()
  @IsString()
  proposalTxId: string;

  @IsOptional()
  @IsString()
  donationTxId?: string;

  @IsOptional()
  @IsUrl()
  donationProof?: string;
}

export class GetRecipientsQuery {
  @IsOptional()
  @IsString()
  creator?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(RecipientType)
  type?: RecipientType;

  @IsOptional()
  @IsEnum(RecipientCategory)
  category?: RecipientCategory;
}

export class GetDonationsQuery {
  @IsOptional()
  @IsString()
  creator?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(RecipientType)
  recipientType?: RecipientType;

  @IsOptional()
  @IsString()
  status?: string; // 'Voting', 'Donated', 'Expired', 'To be Donated'
}
