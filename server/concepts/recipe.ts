import { ObjectId } from "mongodb";
import { BaseDoc } from "../framework/doc";
import { TextWithMedia } from "./textwithmedia";

type MediaObjectId = ObjectId;

class MediaUrl {
  constructor(public readonly url: string) {}
}

type MediaType = TextWithMedia<MediaUrl>;

export interface ManuallyEnteredRecipe {
  dishName: string;
  outputSpecification: Array<MediaType>;
  setupRequirements: Array<MediaType>;
  steps: Array<MediaType>;
}

export interface RecipeDoc extends BaseDoc {
  dishName: string;
  outputSpecification: Array<MediaObjectId>;
  setupRequirements: Array<MediaObjectId>;
  steps: Array<MediaObjectId>;
}
