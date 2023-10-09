import AccessControlConcept from "./concepts/access_control";
import FriendConcept from "./concepts/friend";
import ParentConcept from "./concepts/parentship";
import RecipeManagement from "./concepts/recipe";
import RecipeCollectionConcept from "./concepts/recipe_collection";
import UserConcept from "./concepts/user";
import WebSessionConcept from "./concepts/websession";

// App Definition using concepts
export const WebSession = new WebSessionConcept();
export const User = new UserConcept();
export const Friend = new FriendConcept();
export const Recipe = new RecipeManagement();
export const AccessControl = new AccessControlConcept();
export const RecipeCollectionManagement = new RecipeCollectionConcept();
export const ParentshipManagement = new ParentConcept();
