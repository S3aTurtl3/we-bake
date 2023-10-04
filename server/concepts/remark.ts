import { BaseDoc } from "../framework/doc";
import { MediaType } from "./helper/default_media_type";

export interface ManuallyEnteredRemark {
  content: MediaType;
}

export interface Remark extends BaseDoc {
  content: MediaType;
}
