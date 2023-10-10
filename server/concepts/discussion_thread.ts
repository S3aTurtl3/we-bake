import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

export interface DiscussionThreadDoc extends BaseDoc {
  name: string;
}

export default class DiscussionThreadConcept {
  public readonly discussionThreads = new DocCollection<DiscussionThreadDoc>("discussion_threads");

  async createThread(name: string) {
    const _id = await this.discussionThreads.createOne({ name });
    return { msg: "Thread successfully created!", threadId: _id };
  }

  async deleteThread(_id: ObjectId) {
    await this.discussionThreads.deleteOne({ _id });
    return { msg: "Thread deleted successfully!" };
  }
}
