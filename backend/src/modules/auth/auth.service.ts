import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WalletVerifyDto } from './auth.dto';
import { ethers } from 'ethers';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async verifyWalletSignature(walletVerifyDto: WalletVerifyDto): Promise<boolean> {
    try {
      const { message, signature, address } = walletVerifyDto;
      const decodedAddr = ethers.utils.verifyMessage(message, signature);
      return decodedAddr.toLowerCase() === address.toLowerCase();
    } catch (e) {
      return false;
    }
  }

  async walletLogin(address: string) {
    return this.sign(address);
  }

  async refreshToken(token: string) {
    const payload = this.jwtService.verify(token);
    delete payload.iat;
    delete payload.exp;

    return this.sign(payload.address);
  }

  async sign(address: string): Promise<string> {
    return this.jwtService.sign({ address });
  }
}
