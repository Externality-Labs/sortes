import { IsEthereumAddress } from 'class-validator';
import { Lowercase } from 'src/common/decorators/lowercase.decorator';
import { TimeFilterDto } from './filter.dto';

export class GetPoolSizeDto extends TimeFilterDto {
  @Lowercase()
  @IsEthereumAddress()
  tokenAddress: string;
}

export class GetPriceDto extends GetPoolSizeDto {
  @Lowercase()
  @IsEthereumAddress()
  lpAddress: string;
}
