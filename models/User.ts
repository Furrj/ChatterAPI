import { Document, Schema, Model, model } from "mongoose";

export interface IUser extends Document {
  username: string;
  password: string;
  todos?: any[];
}

const userSchema = new Schema<IUser>({
  username: String,
  password: String,
  todos: [
    {
      type: Schema.Types.ObjectId,
      ref: "Todo",
    },
  ],
});

model<IUser>("User", userSchema);

export {};
