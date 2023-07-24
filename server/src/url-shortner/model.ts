import { Document, model, Schema } from "mongoose";

export interface IUrl extends Document {
  originalUrl: string;
  shortUrl: string;
  createdAt: Date;
  visits: number;
}

const urlSchema = new Schema<IUrl>(
  {
    originalUrl: { type: String, required: true, unique: true },
    shortUrl: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    visits: { type: Number, default: 0 },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

urlSchema.index({ originalUrl: 1 });
urlSchema.index({ shortUrl: 1 });

export const Url = model<IUrl>("Url", urlSchema);
