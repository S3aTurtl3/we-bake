import { Filter, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { MediaType } from "./helper/default_media_type";

export interface ManuallyEnteredRecipe {
  dishName: string;
  outputSpecification: Array<MediaType>;
  setupRequirements: Array<MediaType>;
  steps: Array<MediaType>;
}

export interface RecipeDoc extends BaseDoc {
  dishName: string;
  outputSpecification: Array<MediaType>;
  setupRequirements: Array<MediaType>;
  steps: Array<MediaType>;
}

export default class RecipeManagement {
  public readonly recipes = new DocCollection<RecipeDoc>("recipes");

  async create(content: ManuallyEnteredRecipe) {
    const _id = await this.recipes.createOne({ ...content });
    return { msg: "Recipe successfully created!", recipe: await this.recipes.readOne({ _id }) };
  }

  async getRecipes(query: Filter<RecipeDoc>) {
    const recipes = await this.recipes.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    return recipes;
  }

  async update(_id: ObjectId, update: Partial<RecipeDoc>) {
    await this.recipes.updateOne({ _id }, update);
    return { msg: "Recipe successfully updated!" };
  }

  async delete(_id: ObjectId) {
    await this.recipes.deleteOne({ _id });
    return { msg: "Recipe deleted successfully!" };
  }
}
