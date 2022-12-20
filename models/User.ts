import { Document, Schema, Model, model } from "mongoose";

export interface IUser extends Document {
  username: string;
  password: string;
  posts?: any[];
  name?: string;
  age?: number;
  gender?: string;
  bio?: string;
  communities?: string[];
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
  name: String,
  age: Number,
  gender: String,
  bio: String,
  communities: [
    {
      type: String,
    },
  ],
});

model<IUser>("User", userSchema);

export {};
