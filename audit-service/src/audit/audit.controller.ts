import { Controller, Get, Param } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { AuditService } from "./audit.service";
import { CreateAuditDto } from "./dto/create-audit.dto";

@Controller("audit")
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @MessagePattern("order_status_changed")
  async handleOrderStatusChanged(
    @Payload() dto: CreateAuditDto,
  ): Promise<void> {
    await this.auditService.create(dto);
  }

  @Get(":orderId")
  findByOrderId(@Param("orderId") orderId: string) {
    return this.auditService.findByOrderId(orderId);
  }
}
