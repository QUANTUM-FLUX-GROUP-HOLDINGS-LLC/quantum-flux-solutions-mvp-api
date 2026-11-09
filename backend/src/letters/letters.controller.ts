import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { LettersService } from './letters.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('letters')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'CREDIT_REPAIR')
export class LettersController {
  constructor(private readonly letters: LettersService) {}

  @Get()
  list() {
    return this.letters.list();
  }

  @Patch(':id')
  updateContent(@Param('id') id: string, @Body('content') content: string) {
    return this.letters.updateContent(id, content);
  }
}
