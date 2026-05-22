import { IsString, IsOptional, IsObject, IsDateString } from "class-validator";

/**
 * DTO para el evento que llega desde el orders-service vía TCP.
 * No tiene decoradores HTTP — es un contrato interno entre servicios.
 */
export class CreateAuditDto {
  @IsString()
  orderId: string;

  @IsOptional()
  @IsString()
  fromStatus: string | null;

  @IsString()
  toStatus: string;

  @IsDateString()
  timestamp: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
