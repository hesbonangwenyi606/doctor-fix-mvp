import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.serviceCategory.findMany({ orderBy: { name: 'asc' } });
  }

  create(name: string, description?: string) {
    return this.prisma.serviceCategory.create({ data: { name, description } });
  }
}
