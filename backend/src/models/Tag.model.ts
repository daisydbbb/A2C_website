import mongoose, { Document, Schema } from "mongoose";

export interface ITag extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const tagSchema = new Schema<ITag>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Tag = mongoose.model<ITag>("Tag", tagSchema);
