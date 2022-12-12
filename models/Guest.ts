import { Schema, Model, model, Document } from "mongoose";

export interface IGuest extends Document {
  username: string;
}

const guestSchema = new Schema<IGuest>({
  username: String,
});

model<IGuest>("Guest", guestSchema);

export {};
