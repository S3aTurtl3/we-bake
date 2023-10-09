import { ObjectId } from "mongodb";
import { BaseDoc } from "../framework/doc";
import { NotAllowedError } from "./errors";
import ParentConcept from "./parentship";

type UserContentObjectId = ObjectId;
type UserObjectId = ObjectId;

/**
 * ModerationRecord.author identifies the user who can manage access controls
 * to ModerationRecord.content
 */
export interface ModerationDoc extends BaseDoc {
  author: UserObjectId;
  content: UserContentObjectId;
}

export default class ModerationConcept extends ParentConcept {
  // later, instantiate parentconcept inside class, use own function names
  async assertIsModerator(child: ObjectId, parent: ObjectId) {
    const existingRelationships = await this.getParentships({ child, parent });
    if (existingRelationships.length === 0) {
      throw new NotAllowedError("Moderation permission missing.");
    }
  }
}
