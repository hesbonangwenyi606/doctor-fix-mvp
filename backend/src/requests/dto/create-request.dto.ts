import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { RequestUrgency } from '../../common/enums';

export class CreateRequestDto {
  @IsString()
  categoryId: string;

  @IsString()
  description: string;

  @IsEnum(RequestUrgency)
  urgency: RequestUrgency;

  @IsOptional()
  @IsDateString()
  scheduledFor?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  locationName?: string;
}
