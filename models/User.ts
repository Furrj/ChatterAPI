import { Document, Schema, Model, model } from "mongoose";

export interface IUser extends Document {
  username: string;
  password: string;
  posts?: any[];
}

const userSchema = new Schema<IUser>({
  username: String,
  password: String,
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
});

model<IUser>("User", userSchema);

export {};
