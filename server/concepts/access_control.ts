import { ObjectId } from "mongodb";
import { BaseDoc } from "../framework/doc";

type UserContentObjectId = ObjectId;
type UserObjectId = ObjectId;

export interface AccessController extends BaseDoc {
  usersWithAccess: Array<UserObjectId>;
  content: UserContentObjectId; // help! can i really store a set
}
