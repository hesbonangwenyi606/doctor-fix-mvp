import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CurrentUser } from '../common/current-user.decorator';
import { Role } from '../common/enums';

@Controller('reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CUSTOMER)
export class ReviewsController {
  constructor(private reviews: ReviewsService) {}

  @Post()
  create(
    @CurrentUser() user: { userId: string },
    @Body() body: { bookingId: string; rating: number; comment?: string },
  ) {
    return this.reviews.create(user.userId, body.bookingId, body.rating, body.comment);
  }
}
