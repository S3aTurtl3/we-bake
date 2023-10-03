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
  outputSpecification: MediaType;
  setupRequirements: MediaType;
  steps: MediaType;
}

export interface RecipeDoc extends BaseDoc {
  dishName: string;
  outputSpecification: MediaObjectId;
  setupRequirements: MediaObjectId;
  steps: MediaObjectId;
}
