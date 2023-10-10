import { ObjectId } from "mongodb";
import {
  AccessControl,
  CollectionModeration,
  DiscussionThread,
  DiscussionThreadParentshipManagement,
  Friend,
  ParentshipManagement,
  Recipe,
  RecipeCollectionManagement,
  RecipeModeration,
  RemarkManagement,
  User,
  WebSession,
} from "./app";
import { ContentType } from "./concepts/access_control";
import { ManuallyEnteredRecipe, RecipeDoc } from "./concepts/recipe";
import { Remark } from "./concepts/remark";
import { UserDoc } from "./concepts/user";
import { WebSessionDoc } from "./concepts/websession";
import { Router, getExpressRouter } from "./framework/router";
import Responses from "./responses";

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
   * Creates the recipe and gives the author (the user performing this action) both ownership of and
   * access to the recipe
   *
   * @param session
   * @param recipe JSON string parsable as a ManuallyEnteredRecipe
   * @returns the recipe object
   */
  @Router.post("/recipes")
  async createRecipe(session: WebSessionDoc, recipe: string) {
    // TODO: assert parameters parseable as json (includes not being unded)
    // later put in wrapper parse func that explains error
    // TODO: type check the input fields
    const parsedRecipe: ManuallyEnteredRecipe = JSON.parse(recipe);
    const recipeCreationResponse = await Recipe.create(parsedRecipe);
    const user = WebSession.getUser(session);
    await AccessControl.putAccess(user, recipeCreationResponse.recipeId, ContentType.RECIPE);
    await RecipeModeration.putParentship({ child: recipeCreationResponse.recipeId, parent: user }); // later: create function namses specific to this concept
    return recipeCreationResponse;
  }

  /**
   *
   *
   * @param session of a user with access to the recipe
   * @param _id the id of the recipe
   * @returns the properties of the recipe object
   */
  @Router.get("/recipes/:_id")
  async getRecipe(session: WebSessionDoc, _id: string) {
    const parsedId: ObjectId = new ObjectId(_id); // TODO: handle _id parseable as ObjectId

    const user = WebSession.getUser(session);
    await AccessControl.assertHasAccess(user, parsedId, ContentType.RECIPE);
    return await Recipe.getRecipes({ _id: parsedId });
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
    const user = WebSession.getUser(session);
    const collectionCreationResponse = await RecipeCollectionManagement.createCollection(name);
    await AccessControl.putAccess(user, collectionCreationResponse.id, ContentType.COLLECTION);
    await CollectionModeration.putParentship({ child: collectionCreationResponse.id, parent: user });
    return collectionCreationResponse;
  }

  /**
   * Updates the name of the recipe collection
   *
   * @param session of a user who is the author of the recipe collection
   * @param _id the id of the recipe collection whose name will be updated
   * @param name the name of the recipe collection
   * @returns the created recipe collection object
   */
  @Router.patch("/recipe_collections/:_id")
  async updateRecipeCollectionName(session: WebSessionDoc, _id: string, name: string) {}

  /**
   *
   * @param session
   * @param _id id of recipe collection
   * @returns the name of the recipe collection with the given id
   */
  @Router.get("/recipe_collections/:_id")
  async getRecipeCollectionName(session: WebSessionDoc, _id: string) {}

  /**
   * Uses the fields of `update` to overwrite the fields in the recipe whose id is `_id`
   *
   * @param session of a user who is the author of the recipe
   * @param _id
   * @param update
   * @return a message indicating successful update of the recipe (if successful)
   */
  @Router.patch("/recipes/:_id")
  async updateRecipe(session: WebSessionDoc, _id: string, update: string) {
    // note: it is required that update is string for lightweight front-end... else its fields (which are objects, but were rendered as strings by lightweight frontend) cant be parsed
    // authorship is implemented and validated by the "moderation" concept
    const user = WebSession.getUser(session);
    const parsedId: ObjectId = new ObjectId(_id);
    await AccessControl.assertHasAccess(user, parsedId, ContentType.RECIPE);
    const parsedUpdate: Partial<RecipeDoc> = JSON.parse(update);
    return await Recipe.update(parsedId, parsedUpdate);
  }

  /**
   *
   * @param session of a user with access to the collection
   * @param _id the id of the collection to which a recipe should be added
   * @param recipeId the id of the recipe to add to the collection
   */
  @Router.put("/recipe_collections/:_id/recipes")
  async addRecipeToCollection(session: WebSessionDoc, _id: string, recipeId: string) {
    const user = WebSession.getUser(session);
    const parsedRecipeId: ObjectId = new ObjectId(recipeId); // handle unparseable
    const parsedCollectionId: ObjectId = new ObjectId(_id); // handle unparseable
    await AccessControl.assertHasAccess(user, parsedRecipeId, ContentType.RECIPE);
    await AccessControl.assertHasAccess(user, parsedCollectionId, ContentType.COLLECTION);
    await ParentshipManagement.putParentship({ child: parsedRecipeId, parent: parsedCollectionId });
    return { msg: "Recipe added!" };
  }

  /**
   *
   * @param session of a user who is the author of a recipe collection
   * @param _id the id of the collection
   * @param recipeId the id of the recipe to remove from the collection
   */
  @Router.delete("/recipe_collections/:_id/recipes/:recipeId")
  async removeRecipeFromCollection(session: WebSessionDoc, _id: string, recipeId: string) {
    const user = WebSession.getUser(session);
    const parsedRecipeId: ObjectId = new ObjectId(recipeId); // handle unparseable
    const parsedCollectionId: ObjectId = new ObjectId(_id); // handle unparseable
    await AccessControl.assertHasAccess(user, parsedRecipeId, ContentType.RECIPE);
    await AccessControl.assertHasAccess(user, parsedCollectionId, ContentType.COLLECTION);
    throw Error("not implemented");
  }

  /**
   *
   * @param session of a user with access to the recipe collection
   * @param _id the id of the RecipeCollection
   * @returns the properties of recipes existing in the collection
   */
  @Router.get("/recipe_collections/:_id")
  async getRecipesFromCollection(session: WebSessionDoc, _id: string) {
    const user = WebSession.getUser(session);
    const parsedCollectionId: ObjectId = new ObjectId(_id); // handle unparseable
    await AccessControl.assertHasAccess(user, parsedCollectionId, ContentType.COLLECTION);
    const recipes: ObjectId[] = await ParentshipManagement.getAllChildren(parsedCollectionId);
    return { msg: "Success", recipes: recipes }; // LEFT OFF: Doesn't work anymore
  }

  /**
   *  Grants a user access to the recipe; can only be performed by author of recipe
   *
   * @param session
   * @param recipeId the id of the recipe
   * @param userId the id of the user who will be granted access to the recipe
   */
  @Router.put("/recipe_access_controls/users/:userId/accessibleContent")
  async grantUserAccessToRecipe(session: WebSessionDoc, recipeId: string, userId: string) {
    const user = WebSession.getUser(session);
    const parsedRecipeId: ObjectId = new ObjectId(recipeId); // TODO: handle _id parseable as ObjectId
    const parsedUserId: ObjectId = new ObjectId(userId);
    await RecipeModeration.assertIsModerator(parsedRecipeId, user);
    return await AccessControl.putAccess(parsedUserId, parsedRecipeId, ContentType.RECIPE);
  }

  /**
   * Users with access to a collection by default have access to all recipes that are in and subsequently added to
   * the collection; can only be performed by the recipe collection author
   *
   * @param session
   * @param _id the id of the collection
   * @param userId the id of the user who will be granted access to the collection
   */
  @Router.put("/collection_access_controls/users/:userId/accessibleContent")
  async grantUserAccessToCollection(session: WebSessionDoc, _id: string, userId: string) {
    const user = WebSession.getUser(session);
    const parsedCollectionId: ObjectId = new ObjectId(_id); // TODO: handle _id parseable as ObjectId
    const parsedUserId: ObjectId = new ObjectId(userId);
    await CollectionModeration.assertIsModerator(parsedCollectionId, user);
    return await AccessControl.putAccess(parsedUserId, parsedCollectionId, ContentType.COLLECTION);
  }

  /**
   *
   * @param session
   * @param recipeId the id of the recipe
   * @param userId the id of the user whose access will be removed from the recipe
   */
  @Router.delete("/recipe_access_controls/users/:userId/accessibleContent/:recipeId")
  async removeUserAccessToRecipe(session: WebSessionDoc, recipeId: string, userId: string) {
    const user = WebSession.getUser(session);
    const parsedRecipeId: ObjectId = new ObjectId(recipeId); // TODO: handle _id parseable as ObjectId
    const parsedUserId: ObjectId = new ObjectId(userId);
    await RecipeModeration.assertIsModerator(parsedRecipeId, user);
    return await AccessControl.removeAccess(parsedUserId, parsedRecipeId, ContentType.RECIPE);
  }

  /**
   * Makes it so that the user with id `userId` no longer has access to the the recipe collection corresponding
   * to the access controller with id `_id`; can only be performed by the author of the recipe collection
   *
   * @param session
   * @param _id the id of the collection's access control
   * @param userId the id of the user whose access will be removed from the collection
   */
  @Router.delete("/collection_access_controls/users/:userId/accessibleContent/:_id")
  async removeUserAccessToRecipeCollection(session: WebSessionDoc, _id: string, userId: string) {
    const user = WebSession.getUser(session);
    const parsedCollectionId: ObjectId = new ObjectId(_id); // TODO: handle _id parseable as ObjectId
    const parsedUserId: ObjectId = new ObjectId(userId);
    await CollectionModeration.assertIsModerator(parsedCollectionId, user);
    return await AccessControl.removeAccess(parsedUserId, parsedCollectionId, ContentType.COLLECTION);
  }

  /**
   * Creates a new empty discussion thread associated with the provided recipe; all users with access to the recipe
   * have access to the discussion thread; can only be performed by a user with access to the recipe with id `recipeId`
   *
   * @param session of a user with access to the recipe with id `recipeId`
   * @param recipeId the id of the recipe that the discussion thread is associated with
   * @returns the id of the created discussion thread
   */
  @Router.post("/discussion_threads")
  async startDiscussionThread(session: WebSessionDoc, recipeId: string, name: string) {
    const user = WebSession.getUser(session);
    const parsedRecipeId: ObjectId = new ObjectId(recipeId); // handle unparseable
    await AccessControl.assertHasAccess(user, parsedRecipeId, ContentType.RECIPE);
    const threadCreationResponse = await DiscussionThread.createThread(name);
    await DiscussionThreadParentshipManagement.putParentship({ child: threadCreationResponse.threadId, parent: parsedRecipeId });
    return threadCreationResponse;
  }

  /**
   * Returns the contents of the discussion thread if the user making the request has access to the thread
   *
   * @param session of a user with access to the discussion thread
   * @param _id the id of the discussion thread
   * @returns the Remarks in the discussion thread
   */
  @Router.get("/discussion_threads/:_id")
  async getDiscussionThread(session: WebSessionDoc, _id: string) {
    const user = WebSession.getUser(session);
    const parsedThreadId: ObjectId = new ObjectId(_id); // handle unparseable

    // assert user has access to discussion thread
    // (move the below code into DiscussionThread concept)
    const parentIds: ObjectId[] = (await DiscussionThreadParentshipManagement.getParentships({ child: parsedThreadId })).map(({ parent }) => parent);
    if (parentIds.length !== 1) throw new Error("Discussion threads should have exactly 1 parent");
    const parentRecipe: ObjectId = parentIds[0];

    await AccessControl.assertHasAccess(user, parentRecipe, ContentType.RECIPE);

    const remarks: ObjectId[] = await DiscussionThreadParentshipManagement.getAllChildren(parsedThreadId);
    return { msg: "Success", remarks: remarks };
  }

  /**
   * Posts a comment from the user to the discussion thread if the user has access to the thread
   *
   * @param session of a user with access to the discussion
   * @param discussionId the id of the discussion thread
   * @param remark a string parseable as a Remark; the content that will be posted to the discussion thread
   * @returns a response object containing the id of the created remark under the `id` property
   */
  @Router.post("/discussion_threads/:discussionId/remarks")
  async addRemarkToDiscussion(session: WebSessionDoc, discussionId: string, remark: string) {
    const user = WebSession.getUser(session);
    const parsedThreadId: ObjectId = new ObjectId(discussionId); // handle unparseable
    const parsedRemark: Remark = JSON.parse(remark);

    // assert user has access to discussion thread
    // (move the below code into DiscussionThread concept)
    const parentIds: ObjectId[] = (await DiscussionThreadParentshipManagement.getParentships({ child: parsedThreadId })).map(({ parent }) => parent);
    if (parentIds.length !== 1) throw new Error("Discussion threads should have exactly 1 parent");
    const parentRecipe: ObjectId = parentIds[0];

    await AccessControl.assertHasAccess(user, parentRecipe, ContentType.RECIPE);

    // create remark
    const remarkCreationResponse = await RemarkManagement.create(parsedRemark);

    // add to discussion thread
    await DiscussionThreadParentshipManagement.putParentship({ child: remarkCreationResponse.id, parent: parsedThreadId });

    return remarkCreationResponse;
  }

  /**
   *
   * @param session of a user who has access to the discussion thread to which the remark belongs
   * @param remarkId the id of an existing remark
   * @returns the contents of the remark
   */
  @Router.get("/remarks/:remarkId")
  async getRemark(session: WebSessionDoc, remarkId: string) {
    const user = WebSession.getUser(session);
    const parsedRemarkId: ObjectId = new ObjectId(remarkId);
    // get parent thread
    const parentThreadIds: ObjectId[] = (await DiscussionThreadParentshipManagement.getParentships({ child: parsedRemarkId })).map(({ parent }) => parent);
    if (parentThreadIds.length !== 1) throw new Error("Discussion threads should have exactly 1 parent");
    const parentThreadId: ObjectId = parentThreadIds[0];

    // assert user has access to discussion thread
    // (move the below code into DiscussionThread concept)
    const parentIds: ObjectId[] = (await DiscussionThreadParentshipManagement.getParentships({ child: parentThreadId })).map(({ parent }) => parent);
    if (parentIds.length !== 1) throw new Error("Discussion threads should have exactly 1 parent");
    const parentRecipe: ObjectId = parentIds[0];
    await AccessControl.assertHasAccess(user, parentRecipe, ContentType.RECIPE);

    return await RemarkManagement.getRemarks({ _id: parsedRemarkId });
  }

  /**
   * Removes a comment from the discussion thread
   *
   * @param session of a user with ownership of the recipe to which the discussion belongs
   * @param discussionId the id of the discussion thread
   * @param remarkId the id of the remark to remove
   * @returns the id of the removed remark
   */
  @Router.delete("/discussion_threads/:discussionId/remarks/:remarkId")
  async removeRemarkFromDiscussion(session: WebSessionDoc, discussionId: string, remarkId: string) {
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
