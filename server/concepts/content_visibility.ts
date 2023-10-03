import { ObjectId } from "mongodb";
import { BaseDoc } from "../framework/doc";

export interface Visibility extends BaseDoc {
  user: ObjectId;
  content: Array<ObjectId>;
}
