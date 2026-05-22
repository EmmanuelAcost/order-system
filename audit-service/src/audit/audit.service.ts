import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuditLog, AuditLogDocument } from "./schemas/audit-log.schema";
import { CreateAuditDto } from "./dto/create-audit.dto";

@Injectable()
export class AuditService {
  constructor(
    /**
     * @InjectModel inyecta el modelo de Mongoose para AuditLog.
     * Es el equivalente de @InjectRepository en TypeORM.
     * 'AuditLog' es el nombre de la clase — Mongoose lo usa
     * como identificador del modelo.
     */
    @InjectModel(AuditLog.name)
    private readonly auditLogModel: Model<AuditLogDocument>,
  ) {}

  /**
   * Persiste un evento de auditoría en MongoDB.
   * Los logs son inmutables — solo se crean, nunca se modifican.
   * Por eso no hay métodos update() ni delete() en este servicio.
   */
  async create(dto: CreateAuditDto): Promise<AuditLog> {
    const log = new this.auditLogModel(dto);
    return log.save();
  }

  /**
   * Retorna el historial completo de una orden ordenado por timestamp.
   * sort({ createdAt: 1 }) → orden cronológico (el más antiguo primero)
   * Así el cliente ve la historia de la orden de inicio a fin.
   */
  async findByOrderId(orderId: string): Promise<AuditLog[]> {
    return this.auditLogModel
      .find({ orderId })
      .sort({ createdAt: 1 })
      .lean() // .lean() retorna objetos JS planos en vez de documentos Mongoose
      .exec(); // más eficiente cuando no necesitas métodos de Mongoose
  }
}
