import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(
    authorId: string,
    bookingId: string,
    rating: number,
    comment?: string,
  ) {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be 1-5');
    }
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { serviceRequest: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.serviceRequest.customerId !== authorId) {
      throw new ForbiddenException('Not your booking');
    }
    if (booking.status !== 'COMPLETED') {
      throw new BadRequestException('Can only review completed jobs');
    }

    const review = await this.prisma.review.create({
      data: {
        bookingId,
        authorId,
        technicianId: booking.technicianId,
        rating,
        comment,
      },
    });

    // Recompute technician's running average — simple approach, fine at MVP
    // scale; move to a scheduled aggregate job if volume grows.
    const agg = await this.prisma.review.aggregate({
      where: { technicianId: booking.technicianId },
      _avg: { rating: true },
      _count: true,
    });
    await this.prisma.technicianProfile.update({
      where: { id: booking.technicianId },
      data: {
        ratingAvg: agg._avg.rating ?? 0,
        ratingCount: agg._count,
      },
    });

    return review;
  }
}
