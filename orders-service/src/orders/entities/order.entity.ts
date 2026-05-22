import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { OrderStatus } from "../interfaces/order-status.enum";

@Entity("orders")
@Index(["userId", "status"])
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  @Index()
  userId: string;

  @Column({ type: "varchar", length: 255 })
  productName: string;

  @Column({ type: "int" })
  quantity: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  totalPrice: number;

  @Column({
    type: "enum",
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ type: "text", nullable: true })
  notes: string | null;

  @Column({
    type: "tsvector",
    nullable: true,
    generatedType: "STORED",
    asExpression: `to_tsvector('english', coalesce("productName", '') || ' ' || coalesce(notes, ''))`,
    select: false,
  })
  searchVector: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
