import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('users')
  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        residenceCity: true,
        residenceCountry: true,
      },
      orderBy: { email: 'asc' } // No createdAt currently in User, so order by email
    });
    return users;
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    // Delete the user. All relations (matches, messages, images) will cascade delete
    // as defined in the Prisma schema.
    await this.prisma.user.delete({
      where: { id },
    });
    return { success: true, message: 'User deleted successfully' };
  }
}
