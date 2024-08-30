import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type ConfigDocument = HydratedDocument<Config>;

@Schema()
export class Config {
  @Prop({ required: true, index: true, unique: true })
  key: string;

  @Prop({ required: true })
  value: string;

  @Prop({ required: false, default: false })
  private: boolean;
}

export const ConfigSchema = SchemaFactory.createForClass(Config);
