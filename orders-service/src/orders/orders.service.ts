import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { OrdersRepository } from './orders.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { Order } from './entities/order.entity';
import { OrderStatus, VALID_TRANSITIONS } from './interfaces/order-status.enum';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    @Inject('AUDIT_SERVICE')
    private readonly auditClient: ClientProxy,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    const order = await this.ordersRepository.create(dto);
    await this.emitAuditEvent(order.id, null, OrderStatus.PENDING, {
      action: 'ORDER_CREATED',
      userId: order.userId,
    });
    return order;
  }

  async findAll(query: QueryOrderDto): Promise<PaginatedResult<Order>> {
    const [data, total] = await this.ordersRepository.findAll(query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async search(q: string, page: number, limit: number): Promise<PaginatedResult<Order>> {
    if (!q || q.trim().length < 2) {
      throw new BadRequestException('El parámetro q debe tener al menos 2 caracteres');
    }
    const [data, total] = await this.ordersRepository.fullTextSearch(q.trim(), page, limit);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.ordersRepository.findById(id);
    if (!order) throw new NotFoundException(`Orden con id "${id}" no encontrada`);

    this.validateTransition(order.status, dto.status);

    const previousStatus = order.status;
    const updatedOrder = await this.ordersRepository.updateStatus(id, dto.status);

    await this.emitAuditEvent(id, previousStatus, dto.status, {
      action: 'STATUS_CHANGED',
      userId: order.userId,
    });

    return updatedOrder;
  }

  private validateTransition(from: OrderStatus, to: OrderStatus): void {
    const allowed = VALID_TRANSITIONS[from];
    if (!allowed.includes(to)) {
      throw new BadRequestException(
        `Transición inválida: no se puede pasar de ${from} a ${to}. ` +
        `Permitidas desde ${from}: ${allowed.length ? allowed.join(', ') : 'ninguna'}`,
      );
    }
  }

  private async emitAuditEvent(
    orderId: string,
    fromStatus: OrderStatus | null,
    toStatus: OrderStatus,
    metadata: Record<string, unknown>,
  ): Promise<void> {
    try {
      this.auditClient.emit('order_status_changed', {
        orderId,
        fromStatus,
        toStatus,
        timestamp: new Date().toISOString(),
        metadata,
      });
    } catch (error) {
      console.error('Error emitiendo evento de auditoría:', error);
    }
  }
}