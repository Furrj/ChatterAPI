import { Document, Schema, Model, model } from "mongoose";

export interface ITodo extends Document {
  title: string;
  text: string;
  completed: boolean;
}

const todoSchema = new Schema<ITodo>({
  title: String,
  text: String,
  completed: Boolean,
});

model<ITodo>("Todo", todoSchema);

export {};
