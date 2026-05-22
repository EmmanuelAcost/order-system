import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type AuditLogDocument = HydratedDocument<AuditLog>;

@Schema({ timestamps: true, collection: "audit_logs" })
export class AuditLog {
  @Prop({ required: true, index: true })
  orderId: string;

  // type: String explícito — Mongoose no puede inferir union types (string | null)
  @Prop({ required: false, type: String, default: null })
  fromStatus?: string | null;

  @Prop({ required: true })
  toStatus: string;

  @Prop({ required: true })
  timestamp: string;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ orderId: 1 });
