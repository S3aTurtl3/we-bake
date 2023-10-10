import { Filter, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { MediaType } from "./helper/default_media_type";

export interface Remark {
  content: MediaType;
}

export interface RemarkDoc extends BaseDoc {
  content: MediaType;
}

export default class RemarkConcept {
  public readonly remarks = new DocCollection<RemarkDoc>("recipes");

  async create(remark: Remark) {
    const _id = await this.remarks.createOne(remark);
    return { msg: "Remark successfully created!", id: _id };
  }

  async getRemarks(query: Filter<RemarkDoc>) {
    const recipes = await this.remarks.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    return recipes;
  }

  async update(_id: ObjectId, update: Partial<RemarkDoc>) {
    await this.remarks.updateOne({ _id }, update);
    return { msg: "Remark successfully updated!" };
  }

  async delete(_id: ObjectId) {
    await this.remarks.deleteOne({ _id });
    return { msg: "Remark deleted successfully!" };
  }
}
