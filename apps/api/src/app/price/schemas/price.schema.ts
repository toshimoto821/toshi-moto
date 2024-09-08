import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type PriceDocument = HydratedDocument<Price>;

@Schema({})
export class Price {
  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  timestamp: Date;

  @Prop({ required: true })
  closeTime: Date;

  @Prop({ required: true })
  openTime: Date;

  @Prop({ required: true })
  volume: number;

  @Prop({ required: true })
  interval: string;
}

export const PriceSchema = SchemaFactory.createForClass(Price);

PriceSchema.index({ timestamp: 1, interval: 1 }, { unique: true });
