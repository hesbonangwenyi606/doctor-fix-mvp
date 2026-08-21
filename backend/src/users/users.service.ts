import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { technicianProfile: { include: { categories: { include: { category: true } } } } },
    });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, ...safe } = user;
    return safe;
  }

  async updateTechnicianProfile(
    userId: string,
    data: {
      bio?: string;
      latitude?: number;
      longitude?: number;
      locationName?: string;
      categoryIds?: string[];
    },
  ) {
    const profile = await this.prisma.technicianProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundException('Technician profile not found');

    if (data.categoryIds) {
      await this.prisma.technicianCategory.deleteMany({
        where: { technicianId: profile.id },
      });
      await this.prisma.technicianCategory.createMany({
        data: data.categoryIds.map((categoryId) => ({
          technicianId: profile.id,
          categoryId,
        })),
      });
    }

    return this.prisma.technicianProfile.update({
      where: { userId },
      data: {
        bio: data.bio,
        latitude: data.latitude,
        longitude: data.longitude,
        locationName: data.locationName,
      },
      include: { categories: { include: { category: true } } },
    });
  }

  // Simple, dependency-free straight-line distance (km) for MVP matching —
  // good enough at city scale; swap for a real routing API (Google/OSRM)
  // when doing true drive-time based dispatch.
  static distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
