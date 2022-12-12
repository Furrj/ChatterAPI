import { Document, Schema, Model, model } from "mongoose";

export interface IPost extends Document {
  title: string;
  text: string;
  date: string;
  author?: string;
  guestAuthor?: string;
}

const postSchema = new Schema<IPost>({
  title: String,
  text: String,
  date: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  guestAuthor: String,
});

model<IPost>("Post", postSchema);

export {};
