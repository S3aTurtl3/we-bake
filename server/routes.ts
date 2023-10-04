import { ObjectId } from "mongodb";
import { Friend, User, WebSession } from "./app";
import { ManuallyEnteredRecipe } from "./concepts/recipe";
import { UserDoc } from "./concepts/user";
import { WebSessionDoc } from "./concepts/websession";
import { Router, getExpressRouter } from "./framework/router";
import Responses from "./responses";

// write the specifications for all the sync (also make sfb)

class Routes {
  @Router.get("/session")
  async getSessionUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await User.getUsers();
  }

  @Router.get("/users/:username")
  async getUser(username: string) {
    return await User.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: WebSessionDoc, username: string, password: string) {
    WebSession.isLoggedOut(session);
    return await User.create(username, password);
  }

  @Router.patch("/users")
  async updateUser(session: WebSessionDoc, update: Partial<UserDoc>) {
    const user = WebSession.getUser(session);
    return await User.update(user, update);
  }

  @Router.delete("/users")
  async deleteUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    WebSession.end(session);
    return await User.delete(user);
  }

  @Router.post("/login")
  async logIn(session: WebSessionDoc, username: string, password: string) {
    const u = await User.authenticate(username, password);
    WebSession.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: WebSessionDoc) {
    WebSession.end(session);
    return { msg: "Logged out!" };
  }

  /**
   * Creates the recipe and its corrsesponding access controls
   *
   * @param session
   * @param recipe
   * @returns the recipe object
   */
  @Router.post("/recipes")
  async createRecipe(session: WebSessionDoc, recipe: ManuallyEnteredRecipe) {
    const user = WebSession.getUser(session);
  }

  /**
   * Creates the recipe collection and its corrsesponding access controls
   *
   * @param session
   * @param name the name of the recipe collection
   * @returns the created recipe collection object
   */
  @Router.post("/recipe_collections")
  async createRecipeCollection(session: WebSessionDoc, name: string) {
    //note: unique collection names not required
    const user = WebSession.getUser(session);
  }

  /**
   * Updates the name of the recipe collection
   *
   * @param session
   * @param _id the id of the recipe collection whose name will be updated
   * @param name the name of the recipe collection
   * @returns the created recipe collection object
   */
  @Router.patch("/recipe_collections/:_id")
  async updateRecipeCollectionName(session: WebSessionDoc, _id: ObjectId, name: string) {
    const user = WebSession.getUser(session);
  }

  /**
   * Uses the fields of `update` to overwrite the fields in the recipe whose id is `_id`
   *
   * @param session
   * @param _id
   * @param update
   */
  @Router.patch("/recipes/:_id")
  async updateRecipe(session: WebSessionDoc, _id: ObjectId, update: Partial<ManuallyEnteredRecipe>) {
    const user = WebSession.getUser(session);
  }

  /**
   *
   * @param session
   * @param _id the id of the collection to which a recipe should be added
   * @param recipeId the id of the recipe to add to the collection
   */
  @Router.post("/recipe_collections/:_id/recipes")
  async addRecipeToCollection(session: WebSessionDoc, _id: ObjectId, recipeId: ObjectId) {
    const user = WebSession.getUser(session);
  }

  /**
   *
   * @param session
   * @param _id the id of the collection
   * @param recipeId the id of the recipe to remove from the collection
   */
  @Router.delete("/recipe_collections/:_id/recipes/:recipeId")
  async removeRecipe(session: WebSessionDoc, _id: ObjectId, recipeId: ObjectId) {
    const user = WebSession.getUser(session);
  }

  /**
   *
   * @param session
   * @param _id the id of the RecipeCollection
   * @returns the properties of recipes existing in the collection
   */
  @Router.get("/recipe_collections/:_id")
  async getRecipesFromCollection(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
  }

  /**
   *
   * @param session
   * @param _id the id of the recipe's access control
   * @param userId the id of the user who will be granted access to the recipe
   */
  @Router.post("/recipe_access_controls/:_id/users_with_access")
  async grantUserAccessToRecipe(session: WebSessionDoc, _id: ObjectId, userId: ObjectId) {
    const user = WebSession.getUser(session);
    return user;
  }

  /**
   * Users with access to a collection by default have access to all recipes that are in and subsequently added to
   * the collection
   *
   * @param session
   * @param _id the id of the collection's access control
   * @param userId the id of the user who will be granted access to the collection
   */
  @Router.post("/collection_access_controls/:_id/users_with_access")
  async grantUserAccessToCollection(session: WebSessionDoc, _id: ObjectId, userId: ObjectId) {
    const user = WebSession.getUser(session);
  }

  /**
   *
   * @param session
   * @param _id the id of the recipe's access control
   * @param userId the id of the user whose access will be removed from the recipe
   */
  @Router.delete("/recipe_access_controls/:_id/users_with_access/:userId")
  async removeUserAccessToRecipe(session: WebSessionDoc, _id: ObjectId, userId: ObjectId) {
    const user = WebSession.getUser(session);
  }

  /**
   * Makes it so that the user with id `userId` no longer has access to the the recipe collection corresponding
   * to the access controller with id `_id`
   *
   * @param session
   * @param _id the id of the collection's access control
   * @param userId the id of the user whose access will be removed from the collection
   */
  @Router.delete("/collection_access_controls/:_id/users_with_access/:userId")
  async removeUserAccessToRecipeCollection(session: WebSessionDoc, _id: ObjectId, userId: ObjectId) {
    const user = WebSession.getUser(session);
  }

  /**
   * Creates a new empty discussion thread associated with the provided recipe; all users with access to the recipe
   * have access to the discussion thread
   *
   * @param session
   * @param recipeId the id of the recipe that the discussion thread is associated with
   * @returns the id of the created discussion thread
   */
  @Router.post("/discussion_threads")
  async startDiscussionThread(session: WebSessionDoc, recipeId: ObjectId) {
    const user = WebSession.getUser(session);
  }

  /**
   * Returns the contents of the discussion thread
   *
   * @param session
   * @param _id the id of the discussion thread
   * @returns the id of the created discussion thread
   */
  @Router.get("/discussion_threads/:_id")
  async getDiscussionThread(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
  }

  @Router.get("/friends")
  async getFriends(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.idsToUsernames(await Friend.getFriends(user));
  }

  @Router.delete("/friends/:friend")
  async removeFriend(session: WebSessionDoc, friend: string) {
    const user = WebSession.getUser(session);
    const friendId = (await User.getUserByUsername(friend))._id;
    return await Friend.removeFriend(user, friendId);
  }

  @Router.get("/friend/requests")
  async getRequests(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await Responses.friendRequests(await Friend.getRequests(user));
  }

  @Router.post("/friend/requests/:to")
  async sendFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.sendRequest(user, toId);
  }

  @Router.delete("/friend/requests/:to")
  async removeFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.removeRequest(user, toId);
  }

  @Router.put("/friend/accept/:from")
  async acceptFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.acceptRequest(fromId, user);
  }

  @Router.put("/friend/reject/:from")
  async rejectFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.rejectRequest(fromId, user);
  }
}

export default getExpressRouter(new Routes());
