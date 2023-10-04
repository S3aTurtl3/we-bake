import { ObjectId } from "mongodb";
import { BaseDoc } from "../framework/doc";

export interface RecipeCollection extends BaseDoc {
  name: string;
  recipes: Array<ObjectId>;
}
