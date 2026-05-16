import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: any) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new BadRequestException('Email is already registered.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        name: dto.name,
        age: dto.age,
        bio: dto.bio || '',
        occupation: dto.occupation || '',
        education: dto.education || '',
        religion: dto.religion || '',
        culturalBackground: dto.culturalBackground || '',
        residenceCountry: dto.residenceCountry || '',
        residenceState: dto.residenceState || '',
        residenceCity: dto.residenceCity || '',
        originCountry: dto.originCountry || '',
        originState: dto.originState || '',
        originCity: dto.originCity || '',
      },
    });

    const token = this.jwtService.sign({ id: user.id, email: user.email });
    return { token, user: this.sanitizeUser(user) };
  }

  async login(dto: any) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const token = this.jwtService.sign({ id: user.id, email: user.email });
    return { token, user: this.sanitizeUser(user) };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
