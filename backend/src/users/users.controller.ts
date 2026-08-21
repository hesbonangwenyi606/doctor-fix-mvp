import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: { userId: string }) {
    return this.users.me(user.userId);
  }

  @Patch('me/technician-profile')
  updateTechnicianProfile(
    @CurrentUser() user: { userId: string },
    @Body()
    body: {
      bio?: string;
      latitude?: number;
      longitude?: number;
      locationName?: string;
      categoryIds?: string[];
    },
  ) {
    return this.users.updateTechnicianProfile(user.userId, body);
  }
}
