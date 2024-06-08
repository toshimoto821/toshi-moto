import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type PriceDocument = HydratedDocument<Price>;

@Schema()
export class Price {
  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true, unique: true })
  timestamp: Date;

  @Prop({ required: true })
  volume: number;
}

export const PriceSchema = SchemaFactory.createForClass(Price);
