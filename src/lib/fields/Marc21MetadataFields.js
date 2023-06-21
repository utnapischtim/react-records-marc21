// This file is part of Invenio.
//
// Copyright (C) 2021-2022 Graz University of Technology.
//
// React-Records-Marc21 is free software; you can redistribute it and/or
// modify it under the terms of the MIT License; see LICENSE file for more
// details.

const { Marc, Record } = require("marcjs");
import { get, set, has, pick, cloneDeep } from "lodash";
import { Field } from "./Field";

export class Marc21MetadataFields extends Field {
  controlfields = ["001", "003", "005", "006", "007", "008", "009"];
  constructor({ fieldpath, deserializedDefault = [], serializedDefault = [] }) {
    super({ fieldpath, deserializedDefault, serializedDefault });
  }

  /**
   * Compare Metadata field order for sorting in frontend.
   * @method
   * @param {object} field1 - first field to compare
   * @returns {object} field1 -  second field to compare
   */
  compare(field1, field2) {
    if (field1.id < field2.id) {
      return -1;
    }
    if (field1.id > field2.id) {
      return 1;
    }
    return 0;
  }

  /**
   * Deserialize backend record into format compatible with frontend.
   * @method
   * @param {object} record - potentially empty object
   * @returns {object} frontend compatible record object
   */
  deserialize(record) {
    let deserializedRecord = record;
    deserializedRecord = pick(deserializedRecord, [
      "metadata",
      "id",
      "links",
      "files",
      "pids",
    ]);
    for (let key in this.depositRecordSchema) {
      deserializedRecord = this.depositRecordSchema[key].deserialize(
        deserializedRecord,
        this.defaultLocale
      );
    }
    return deserializedRecord;
  }

  /**
   * Deserialize backend field into format compatible with frontend using
   * the given schema.
   * @method
   * @param {object} element - potentially empty object
   * @returns {object} frontend compatible element object
   */
  deserialize(record) {
    return record;
  }

  static _serialize_subfields(subfields) {
    let fields = [];
    subfields = subfields.trim();
    const subfield_list = subfields.split("$$").filter(String);

    for (let i = 0; i < subfield_list.length; i++) {
      const subfield = subfield_list[i].split(" ");
      fields = fields.concat([subfield[0], subfield.slice(1).join(" ")]);
    }
    return fields;
  }

  _serialize_fields(marc_record, fields) {
    let metadata = [];
    for (const field of Object.values(fields)) {
      let subfields = field["subfield"];
      if (!this.controlfields.includes(field["id"])) {
        subfields = Marc21MetadataFields._serialize_subfields(field["subfield"]);
      }
      let ind1 = field["ind1"].replace(" ", "_");
      let ind2 = field["ind2"].replace(" ", "_");
      let internal = [field["id"], ind1 + ind2].concat(subfields);

      marc_record.append(internal);
    }
    return metadata;
  }

  /**
   * Serialize element to send to the backend.
   * @method
   * @param {object} element - in frontend format
   * @returns {object} element - in API format
   *
   */
  serialize(record) {
    let record_dict = get(record, this.fieldpath, this.serializedDefault);
    let metadata = new Record();
    if (has(record_dict, ["leader"])) {
      metadata.leader = record_dict.leader;
    } else {
      metadata.leader = "";
    }
    if (has(record_dict, ["fields"])) {
      record_dict.fields = this._serialize_fields(metadata, record_dict.fields);
    }
    const marcxml = metadata.as("marcxml");

    return set(cloneDeep(record), this.fieldpath, marcxml);
  }
}
