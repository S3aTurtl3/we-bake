import FriendConcept from "./concepts/friend";
import RecipeManagement from "./concepts/recipe";
import UserConcept from "./concepts/user";
import WebSessionConcept from "./concepts/websession";

// App Definition using concepts
export const WebSession = new WebSessionConcept();
export const User = new UserConcept();
export const Friend = new FriendConcept();
export const Recipe = new RecipeManagement();
