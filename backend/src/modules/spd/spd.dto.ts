import { IsNotEmpty, IsString, IsUrl, Length } from 'class-validator';

export class SpdDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 35)
  name: string;

  @IsNotEmpty()
  @IsString()
  donationId: string;

  @IsNotEmpty()
  @IsString()
  @IsUrl()
  image: string;

  @IsNotEmpty()
  @IsString()
  probabilityTableId: string;
}
