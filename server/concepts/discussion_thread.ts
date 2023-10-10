import { ObjectId } from "mongodb";
import { BaseDoc } from "../framework/doc";

export interface DiscussionThread extends BaseDoc {
  parent: ObjectId;
  remarks: Array<ObjectId>;
}
