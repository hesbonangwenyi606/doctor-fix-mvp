import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CurrentUser } from '../common/current-user.decorator';
import { Role } from '../common/enums';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private bookings: BookingsService) {}

  @Post('accept/:requestId')
  @UseGuards(RolesGuard)
  @Roles(Role.TECHNICIAN)
  accept(@CurrentUser() user: { userId: string }, @Param('requestId') requestId: string) {
    return this.bookings.accept(user.userId, requestId);
  }

  @Get('mine')
  @UseGuards(RolesGuard)
  @Roles(Role.TECHNICIAN)
  mine(@CurrentUser() user: { userId: string }) {
    return this.bookings.myJobs(user.userId);
  }

  @Post(':id/start')
  @UseGuards(RolesGuard)
  @Roles(Role.TECHNICIAN)
  start(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.bookings.start(user.userId, id);
  }

  @Post(':id/complete')
  @UseGuards(RolesGuard)
  @Roles(Role.TECHNICIAN)
  complete(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() body: { amount?: number },
  ) {
    return this.bookings.complete(user.userId, id, body?.amount);
  }

  @Post(':id/mark-paid')
  @UseGuards(RolesGuard)
  @Roles(Role.CUSTOMER)
  markPaid(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.bookings.markPaid(user.userId, id);
  }
}
