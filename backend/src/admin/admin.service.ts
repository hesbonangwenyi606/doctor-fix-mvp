import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  listTechnicians() {
    return this.prisma.technicianProfile.findMany({
      include: { user: true, categories: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async verifyTechnician(technicianProfileId: string, verified: boolean) {
    const profile = await this.prisma.technicianProfile.findUnique({
      where: { id: technicianProfileId },
    });
    if (!profile) throw new NotFoundException('Technician profile not found');
    return this.prisma.technicianProfile.update({
      where: { id: technicianProfileId },
      data: { verified },
    });
  }

  listRequests() {
    return this.prisma.serviceRequest.findMany({
      include: {
        category: true,
        customer: true,
        booking: { include: { technician: { include: { user: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async stats() {
    const [customers, technicians, verifiedTechnicians, openRequests, completedBookings] =
      await Promise.all([
        this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
        this.prisma.user.count({ where: { role: 'TECHNICIAN' } }),
        this.prisma.technicianProfile.count({ where: { verified: true } }),
        this.prisma.serviceRequest.count({ where: { status: 'OPEN' } }),
        this.prisma.booking.count({ where: { status: 'COMPLETED' } }),
      ]);
    return { customers, technicians, verifiedTechnicians, openRequests, completedBookings };
  }
}
