import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

/**
 * Maps the user represented by AccessControllerDoc.user to the set of instances user-created content that the user has access to
 */
export interface AccessControlDoc extends BaseDoc {
  accessibleContent: Array<ObjectId>;
  user: ObjectId;
}

/**
 * purpose: To make it possible for sharing recipes with trusted users, and to allow moderation of discussion threads
 *  for the recipe
 *
 * principle: A user who is granted with access to a Recipe can view the recipe and navigate to it within the
 *  application; Access to a DiscussionThread allows a user to both read and contribute to a discussion thread. Without access, none of these actions can be performed.
 */
export default class AccessControlConcept {
  public readonly recipeAccessControls = new DocCollection<AccessControlDoc>("recipe_access_controls");

  async putAccess(user: ObjectId, userContent: ObjectId) {
    try {
      const controlDoc = await this.getAccessControl(user);
      const accessibleContent: ObjectId[] = controlDoc.accessibleContent.slice();
      accessibleContent.push(userContent);
      await this.recipeAccessControls.updateOne({ _id: controlDoc._id }, { accessibleContent: accessibleContent });
    } catch (e) {
      // TODO: catch only not-found errors
      await this.recipeAccessControls.createOne({ user: user, accessibleContent: [userContent] });
    }

    return { msg: "User was granted access!" };
  }

  async removeAccess(user: ObjectId, userContent: ObjectId) {
    const controlDoc = await this.getAccessControl(user);
    const accessibleContent: ObjectId[] = controlDoc.accessibleContent.slice(); // defensive copy

    const index = accessibleContent.findIndex((objectId) => objectId.toString() === userContent.toString());
    if (index > -1) {
      accessibleContent.splice(index, 1);
      await this.recipeAccessControls.updateOne({ _id: controlDoc._id }, { accessibleContent: accessibleContent });
    } // notify someone if "else"...
    return { msg: "Completed." };
  }

  private async canAccess(user: ObjectId, userContent: ObjectId): Promise<boolean> {
    const accessibleContent = await this.getAccessibleContent(user);
    return accessibleContent.map((id) => id.toString()).includes(userContent.toString());
  }

  async assertHasAccess(user: ObjectId, userContent: ObjectId): Promise<void> {
    const canAccess = await this.canAccess(user, userContent);
    if (!canAccess) {
      throw new NotAllowedError("The user does not have access to this content.");
    }
  }

  /**
   *
   * @param user
   * @returns the list of objects the user has access to
   */
  private async getAccessControl(user: ObjectId): Promise<AccessControlDoc> {
    const query = { user: user };
    const accessControlDoc: AccessControlDoc | null = await this.recipeAccessControls.readOne(query);
    if (accessControlDoc === null) {
      throw new NotFoundError(`Corresponding access control not found!`);
    }
    return accessControlDoc;
  }

  /**
   *
   * @param user
   * @returns a (defensive copy) of the content that the user has access to
   */
  async getAccessibleContent(user: ObjectId): Promise<Array<ObjectId>> {
    const controlDoc = await this.getAccessControl(user);
    return controlDoc.accessibleContent.slice();
  }
}
