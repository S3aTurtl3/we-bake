import { Filter, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

export interface ParentShip {
  child: ObjectId;
  parent: ObjectId;
}

export interface ParentShipDoc extends BaseDoc {
  child: ObjectId;
  parent: ObjectId;
}

export default class ParentConcept {
  public readonly parentships = new DocCollection<ParentShipDoc>("parentships");

  async putParentship(parentShip: ParentShip) {
    const existing: ParentShipDoc[] = await this.getParentships(parentShip);
    let _id: ObjectId;
    if (existing.length === 0) {
      _id = await this.parentships.createOne(parentShip);
    } else {
      _id = existing[0]._id;
    }
    return { msg: "Parentship successfully put!", recordId: _id };
  }

  async getParentships(query: Filter<ParentShipDoc>) {
    const parentships = await this.parentships.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    return parentships;
  }

  async delete(_id: ObjectId) {
    await this.parentships.deleteOne({ _id });
    return { msg: "Parentship deleted successfully!" };
  }

  async deleteRelationship(child: ObjectId, parent: ObjectId) {
    (await this.getParentships({ parent, child })).map(({ _id }) => _id).forEach(async (_id) => await this.parentships.deleteOne({ _id }));
    return { msg: "Parentship deleted successfully!" };
  }

  async getAllChildren(parent: ObjectId): Promise<ObjectId[]> {
    return (await this.parentships.readMany({ parent })).map(({ child }) => child);
  }
}
