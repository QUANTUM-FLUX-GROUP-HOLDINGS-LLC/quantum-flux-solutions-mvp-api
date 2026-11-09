import { IsString, Matches, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class UpdateBusinessProfileDto {
  @IsString()
  @IsOptional()
  entityType?: string;

  // Strict validation: 2 digits, hyphen, 7 digits.
  @IsString()
  @IsOptional()
  @Matches(/^\d{2}-\d{7}$/, { message: 'EIN must be in the format XX-XXXXXXX (e.g., 12-3456789)' })
  ein?: string;

  @IsNumber()
  @IsOptional()
  grossRevenue?: number;

  @IsBoolean()
  @IsOptional()
  hasEmployees?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}
