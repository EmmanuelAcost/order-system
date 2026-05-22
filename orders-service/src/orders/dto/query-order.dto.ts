import { IsEnum, IsOptional, IsUUID, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";
import { OrderStatus } from "../interfaces/order-status.enum";

export class QueryOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsUUID("4")
  userId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
