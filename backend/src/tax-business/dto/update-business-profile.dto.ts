import { IsString, Matches, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class UpdateBusinessProfileDto {
  @IsString()
  @IsOptional()
  entityType?: string;

  // VALIDACIÓN ESTRICTA: 2 números, guion, 7 números
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
}
