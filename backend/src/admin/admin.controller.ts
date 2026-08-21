import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '../common/enums';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('technicians')
  listTechnicians() {
    return this.admin.listTechnicians();
  }

  @Patch('technicians/:id/verify')
  verify(@Param('id') id: string, @Body() body: { verified: boolean }) {
    return this.admin.verifyTechnician(id, body.verified);
  }

  @Get('requests')
  listRequests() {
    return this.admin.listRequests();
  }

  @Get('stats')
  stats() {
    return this.admin.stats();
  }
}
