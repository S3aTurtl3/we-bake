import { ObjectId } from "mongodb";
import { BaseDoc } from "../framework/doc";

export interface Remark extends BaseDoc {
  content: ObjectId;
}
