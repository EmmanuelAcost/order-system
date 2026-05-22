import {
  IsUUID,
  IsString,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
  MinLength,
  MaxLength,
  IsPositive,
} from "class-validator";

export class CreateOrderDto {
  @IsUUID("4", { message: "userId debe ser un UUID v4 válido" })
  userId: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  productName: string;

  @IsInt({ message: "quantity debe ser un número entero" })
  @Min(1, { message: "La cantidad mínima es 1" })
  quantity: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  totalPrice: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
