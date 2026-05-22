import { IsEnum } from 'class-validator';
import { OrderStatus } from '../interfaces/order-status.enum';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, {
    message: `status debe ser uno de: ${Object.values(OrderStatus).join(', ')}`,
  })
  status: OrderStatus;
}