import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface RecipeCollectionDoc extends BaseDoc {
  name: string;
}

export default class RecipeCollectionConcept {
  public readonly collections = new DocCollection<RecipeCollectionDoc>("discussion_threads");

  async createCollection(name: string) {
    const _id = await this.collections.createOne({ name });
    return { msg: "Collection successfully created!", id: _id };
  }

  async getCollectionById(_id: ObjectId) {
    const collection = await this.collections.readOne({ _id });
    if (collection === null) {
      throw new NotFoundError(`Collection not found!`);
    }
    return collection;
  }

  async update(_id: ObjectId, update: Partial<RecipeCollectionDoc>) {
    await this.collections.updateOne({ _id }, update);
    return { msg: "Collection name successfully updated!" };
  }

  async deleteCollection(_id: ObjectId) {
    await this.collections.deleteOne({ _id });
    return { msg: "Collection deleted successfully!" };
  }
}
