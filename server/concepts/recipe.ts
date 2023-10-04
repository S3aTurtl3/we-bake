import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { MediaType } from "./helper/default_media_type";

type MediaObjectId = ObjectId;

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
  outputSpecification: Array<MediaObjectId>;
  setupRequirements: Array<MediaObjectId>;
  steps: Array<MediaObjectId>;
}
