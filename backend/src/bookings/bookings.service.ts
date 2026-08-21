import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  // Technician accepts an OPEN request -> creates Booking, request -> MATCHED
  async accept(technicianUserId: string, serviceRequestId: string) {
    const profile = await this.prisma.technicianProfile.findUnique({
      where: { userId: technicianUserId },
    });
    if (!profile) throw new NotFoundException('Technician profile not found');
    if (!profile.verified) {
      throw new ForbiddenException('Technician not yet verified by admin');
    }

    const request = await this.prisma.serviceRequest.findUnique({
      where: { id: serviceRequestId },
    });
    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== 'OPEN') {
      throw new BadRequestException('Request is no longer open');
    }

    const [booking] = await this.prisma.$transaction([
      this.prisma.booking.create({
        data: {
          serviceRequestId,
          technicianId: profile.id,
          status: 'MATCHED',
        },
      }),
      this.prisma.serviceRequest.update({
        where: { id: serviceRequestId },
        data: { status: 'MATCHED' },
      }),
    ]);
    return booking;
  }

  async myJobs(technicianUserId: string) {
    const profile = await this.prisma.technicianProfile.findUnique({
      where: { userId: technicianUserId },
    });
    if (!profile) throw new NotFoundException('Technician profile not found');
    return this.prisma.booking.findMany({
      where: { technicianId: profile.id },
      include: { serviceRequest: { include: { category: true, customer: true } }, payment: true },
      orderBy: { acceptedAt: 'desc' },
    });
  }

  private async ensureOwnBooking(technicianUserId: string, bookingId: string) {
    const profile = await this.prisma.technicianProfile.findUnique({
      where: { userId: technicianUserId },
    });
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (!profile || booking.technicianId !== profile.id) {
      throw new ForbiddenException('Not your job');
    }
    return booking;
  }

  async start(technicianUserId: string, bookingId: string) {
    await this.ensureOwnBooking(technicianUserId, bookingId);
    const [booking] = await this.prisma.$transaction([
      this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'IN_PROGRESS', startedAt: new Date() },
      }),
    ]);
    await this.prisma.serviceRequest.update({
      where: { id: booking.serviceRequestId },
      data: { status: 'IN_PROGRESS' },
    });
    return booking;
  }

  async complete(technicianUserId: string, bookingId: string, amount?: number) {
    await this.ensureOwnBooking(technicianUserId, bookingId);
    const booking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
    await this.prisma.serviceRequest.update({
      where: { id: booking.serviceRequestId },
      data: { status: 'COMPLETED' },
    });
    if (amount != null) {
      // Payment is stubbed PENDING here — wiring a real gateway (M-Pesa/
      // Stripe) means creating the charge here and updating status via
      // its webhook instead of the customer-facing markPaid() below.
      await this.prisma.payment.create({
        data: { bookingId, amount, status: 'PENDING' },
      });
    }
    return booking;
  }

  // Stub "mark as paid" endpoint standing in for a real payment webhook.
  async markPaid(customerId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { serviceRequest: true, payment: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.serviceRequest.customerId !== customerId) {
      throw new ForbiddenException('Not your booking');
    }
    if (!booking.payment) throw new BadRequestException('No payment to settle');
    return this.prisma.payment.update({
      where: { bookingId },
      data: { status: 'PAID', providerRef: `STUB-${Date.now()}` },
    });
  }
}
