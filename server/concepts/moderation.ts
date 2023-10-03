import { ObjectId } from "mongodb";
import { BaseDoc } from "../framework/doc";

type UserContentObjectId = ObjectId;
type UserObjectId = ObjectId;

/**
 * ModerationRecord.author identifies the user who can manage access controls
 * to ModerationRecord.content
 */
export interface ModerationRecord extends BaseDoc {
  author: UserObjectId;
  content: UserContentObjectId;
}
