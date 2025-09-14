import { Body, Controller, Post, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Public } from '../../common/guards/jwt.auth.guard';
import { AuthService } from './auth.service';

import { WalletVerifyDto } from './auth.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt.auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('wallet-login')
  @Public()
  async walletLogin(@Body() walletVerifyDto: WalletVerifyDto) {
    const isValid = await this.authService.verifyWalletSignature(walletVerifyDto);
    if (!isValid) {
      throw new UnauthorizedException('Invalid signature');
    }
    return this.authService.walletLogin(walletVerifyDto.address);
  }

  @Post('logout')
  logout() {
    // return this.authService.logout();
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh-token')
  async refreshToken(@Request() req: Request) {
    const token = req.headers['authorization'].split(' ')[1];
    const newToken = await this.authService.refreshToken(token);
    return newToken;
  }
}
