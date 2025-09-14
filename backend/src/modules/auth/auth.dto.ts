import { Lowercase } from 'src/common/decorators/lowercase.decorator';
import { IsNotEmpty } from 'class-validator';

export class WalletVerifyDto {
  @Lowercase()
  @IsNotEmpty()
  address: string;

  @IsNotEmpty()
  signature: string;

  @IsNotEmpty()
  message: string;
}
