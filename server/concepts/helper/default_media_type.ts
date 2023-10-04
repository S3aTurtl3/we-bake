import { TextWithMedia } from "../textwithmedia";
class MediaUrl {
  constructor(public readonly url: string) {}
}

export type MediaType = TextWithMedia<MediaUrl>;
