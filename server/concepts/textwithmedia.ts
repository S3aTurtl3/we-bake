import { BaseDoc } from "../framework/doc";

export interface TextWithMedia<Visual> {
  instructions: string;
  visuals: Array<Visual>;
}

export interface TextWithMediaDoc<Visual> extends BaseDoc {
  instructions: string;
  visuals: Array<Visual>;
}
