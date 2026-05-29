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
        firstName: dto.firstName || '',
        lastName: dto.lastName || '',
        dateOfBirth: dto.dateOfBirth || '',
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
        smoking: dto.smoking || 'Non-smoker',
        drinking: dto.drinking || 'Never',
        maritalStatus: dto.maritalStatus || 'Never Married',
        childrenStatus: dto.childrenStatus || 'No kids',
        marriageTimeline: dto.marriageTimeline || 'ASAP',
        willingToRelocate: dto.willingToRelocate || 'Maybe',
        childrenPreference: dto.childrenPreference || 'Open to children',
        marriageExpectations: dto.marriageExpectations || '',
        careerGoals: dto.careerGoals || '',
      },
    });

    const token = this.jwtService.sign({ id: user.id, email: user.email, role: user.role });
    return { token, user: this.sanitizeUser(user) };
  }

  async login(dto: any) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (user.isSuspended) {
      throw new UnauthorizedException('Your account has been suspended by an administrator.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const token = this.jwtService.sign({ id: user.id, email: user.email, role: user.role });
    return { token, user: this.sanitizeUser(user) };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...result } = user;
    return result;
  }

  async seedAdmin() {
    const email = 'admin@knot.com';
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      const passwordHash = await bcrypt.hash('Admin123!', 10);
      await this.prisma.user.update({ where: { email }, data: { role: 'ADMIN', passwordHash } });
      return { message: 'Admin account is ready. Password is: Admin123!' };
    }

    const passwordHash = await bcrypt.hash('Admin123!', 10);
    await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: 'System',
        lastName: 'Admin',
        role: 'ADMIN',
      }
    });
    return { message: 'Admin account successfully seeded! Password is: Admin123!' };
  }
}
