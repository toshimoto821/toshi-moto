import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type DeviceDocument = HydratedDocument<Device>;

@Schema({ timestamps: true })
export class Device {
  @Prop({ required: true, index: true, unique: true })
  endpoint: string;

  @Prop({})
  expirationTime: string;

  @Prop({
    type: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    required: true,
  })
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
