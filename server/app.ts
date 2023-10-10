import AccessControlConcept from "./concepts/access_control";
import DiscussionThreadConcept from "./concepts/discussion_thread";
import FriendConcept from "./concepts/friend";
import ModerationConcept from "./concepts/moderation";
import ParentConcept from "./concepts/parentship";
import RecipeManagement from "./concepts/recipe";
import RecipeCollectionConcept from "./concepts/recipe_collection";
import RemarkConcept from "./concepts/remark";
import UserConcept from "./concepts/user";
import WebSessionConcept from "./concepts/websession";

// App Definition using concepts
export const WebSession = new WebSessionConcept();
export const User = new UserConcept();
export const Friend = new FriendConcept();
export const Recipe = new RecipeManagement();
export const AccessControl = new AccessControlConcept();
export const RecipeCollectionManagement = new RecipeCollectionConcept();
export const ParentshipManagement = new ParentConcept("content");
export const DiscussionThreadParentshipManagement = new ParentConcept("discussion_thread");
export const RecipeModeration = new ModerationConcept("recipe"); // choose different representation if only one mod allowed
export const CollectionModeration = new ModerationConcept("collection");
export const DiscussionThread = new DiscussionThreadConcept();
export const RemarkManagement = new RemarkConcept();
