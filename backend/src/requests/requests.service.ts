import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class RequestsService {
  constructor(private prisma: PrismaService) {}

  create(customerId: string, dto: CreateRequestDto) {
    return this.prisma.serviceRequest.create({
      data: {
        customerId,
        categoryId: dto.categoryId,
        description: dto.description,
        urgency: dto.urgency,
        scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : null,
        latitude: dto.latitude,
        longitude: dto.longitude,
        locationName: dto.locationName,
      },
      include: { category: true },
    });
  }

  myRequests(customerId: string) {
    return this.prisma.serviceRequest.findMany({
      where: { customerId },
      include: { category: true, booking: { include: { technician: { include: { user: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const req = await this.prisma.serviceRequest.findUnique({
      where: { id },
      include: { category: true, customer: true, booking: true },
    });
    if (!req) throw new NotFoundException('Request not found');
    return req;
  }

  // Matching: verified technicians whose categories include the request's
  // category, sorted by distance when both sides have coordinates (nearest
  // first), else returned unsorted. This is the seam for smarter dispatch
  // (load balancing, ratings weighting, ETA) later.
  async matchingTechnicians(requestId: string) {
    const req = await this.findOne(requestId);
    const candidates = await this.prisma.technicianProfile.findMany({
      where: {
        verified: true,
        categories: { some: { categoryId: req.categoryId } },
      },
      include: { user: true, categories: { include: { category: true } } },
    });

    if (req.latitude == null || req.longitude == null) return candidates;

    return candidates
      .map((tech) => ({
        ...tech,
        distanceKm:
          tech.latitude != null && tech.longitude != null
            ? UsersService.distanceKm(
                req.latitude as number,
                req.longitude as number,
                tech.latitude,
                tech.longitude,
              )
            : null,
      }))
      .sort((a, b) => {
        if (a.distanceKm == null) return 1;
        if (b.distanceKm == null) return -1;
        return a.distanceKm - b.distanceKm;
      });
  }

  // Open requests whose category matches one this technician covers —
  // the technician-facing "available jobs" feed.
  async availableForTechnician(technicianUserId: string) {
    const profile = await this.prisma.technicianProfile.findUnique({
      where: { userId: technicianUserId },
      include: { categories: true },
    });
    if (!profile || !profile.verified) return [];
    const categoryIds = profile.categories.map((c) => c.categoryId);
    if (categoryIds.length === 0) return [];

    return this.prisma.serviceRequest.findMany({
      where: { status: 'OPEN', categoryId: { in: categoryIds } },
      include: { category: true, customer: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async cancel(customerId: string, requestId: string) {
    const req = await this.findOne(requestId);
    if (req.customerId !== customerId) {
      throw new ForbiddenException('Not your request');
    }
    return this.prisma.serviceRequest.update({
      where: { id: requestId },
      data: { status: 'CANCELLED' },
    });
  }
}
