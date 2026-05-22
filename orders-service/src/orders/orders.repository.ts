import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "./entities/order.entity";
import { CreateOrderDto } from "./dto/create-order.dto";
import { QueryOrderDto } from "./dto/query-order.dto";
import { OrderStatus } from "./interfaces/order-status.enum";

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectRepository(Order)
    private readonly repo: Repository<Order>,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    const order = this.repo.create({
      ...dto,
      status: OrderStatus.PENDING,
    });
    return this.repo.save(order);
  }

  async findById(id: string): Promise<Order | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findAll(query: QueryOrderDto): Promise<[Order[], number]> {
    const { status, userId, page = 1, limit = 20 } = query;

    const qb = this.repo
      .createQueryBuilder("order")
      .orderBy("order.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    if (status) qb.andWhere("order.status = :status", { status });
    if (userId) qb.andWhere("order.userId = :userId", { userId });

    return qb.getManyAndCount();
  }

  async fullTextSearch(
    q: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<[Order[], number]> {
    return this.repo
      .createQueryBuilder("order")
      .where(`order."searchVector" @@ plainto_tsquery('english', :q)`, { q })
      .orderBy(
        `ts_rank(order."searchVector", plainto_tsquery('english', :q))`,
        "DESC",
      )
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    await this.repo.update(id, { status });
    return this.findById(id) as Promise<Order>;
  }
}
