import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  PipeTransform,
  Injectable,
  ArgumentMetadata,
} from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { QueryOrderDto } from "./dto/query-order.dto";

@Injectable()
class ParseIntWithDefaultPipe implements PipeTransform {
  constructor(private readonly defaultValue: number) {}
  transform(value: unknown, _metadata: ArgumentMetadata): number {
    if (value === undefined || value === null || value === "")
      return this.defaultValue;
    const parsed = parseInt(String(value), 10);
    return isNaN(parsed) ? this.defaultValue : parsed;
  }
}

@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  // IMPORTANTE: /search debe ir ANTES de /:id
  @Get("search")
  search(
    @Query("q") q: string,
    @Query("page", new ParseIntWithDefaultPipe(1)) page: number,
    @Query("limit", new ParseIntWithDefaultPipe(20)) limit: number,
  ) {
    return this.ordersService.search(q, page, limit);
  }

  @Get()
  findAll(@Query() query: QueryOrderDto) {
    return this.ordersService.findAll(query);
  }

  @Put(":id/status")
  updateStatus(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateStatusDto);
  }
}
