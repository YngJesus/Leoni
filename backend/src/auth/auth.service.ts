import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Verify password match for a given user
   */
  async validateUser(loginDto: LoginDto) {
    const user = await this.usersService.findByMatricule(loginDto.matricule);
    if (!user) {
      throw new UnauthorizedException('Invalid matricule or password');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid matricule or password');
    }

    const result = { ...user };
    delete (result as { password?: string }).password;
    return result;
  }

  /**
   * Generate signed JWT token
   */
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto);

    const payload = {
      sub: user.id,
      matricule: user.matricule,
      nomComplet: user.nomComplet,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
