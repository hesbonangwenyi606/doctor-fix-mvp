import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CurrentUser } from '../common/current-user.decorator';
import { Role } from '../common/enums';

@Controller('requests')
@UseGuards(JwtAuthGuard)
export class RequestsController {
  constructor(private requests: RequestsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.CUSTOMER)
  create(@CurrentUser() user: { userId: string }, @Body() dto: CreateRequestDto) {
    return this.requests.create(user.userId, dto);
  }

  @Get('mine')
  @UseGuards(RolesGuard)
  @Roles(Role.CUSTOMER)
  mine(@CurrentUser() user: { userId: string }) {
    return this.requests.myRequests(user.userId);
  }

  @Get('available/for-technician')
  @UseGuards(RolesGuard)
  @Roles(Role.TECHNICIAN)
  availableForTechnician(@CurrentUser() user: { userId: string }) {
    return this.requests.availableForTechnician(user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requests.findOne(id);
  }

  @Get(':id/matches')
  @UseGuards(RolesGuard)
  @Roles(Role.CUSTOMER, Role.ADMIN)
  matches(@Param('id') id: string) {
    return this.requests.matchingTechnicians(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.CUSTOMER)
  cancel(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.requests.cancel(user.userId, id);
  }
}
