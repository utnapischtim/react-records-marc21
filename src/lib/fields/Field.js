// This file is part of Invenio.
//
// Copyright (C) 2021-2022 Graz University of Technology.
//
// React-Records-Marc21 is free software; you can redistribute it and/or
// modify it under the terms of the MIT License; see LICENSE file for more
// details.

import { get, set, cloneDeep } from "lodash";

export class Field {
  constructor({ fieldpath, deserializedDefault = null, serializedDefault = null }) {
    this.fieldpath = fieldpath;
    this.deserializedDefault = deserializedDefault;
    this.serializedDefault = serializedDefault;
  }

  deserialize(record) {
    let fieldValue = get(record, this.fieldpath, this.deserializedDefault);
    if (fieldValue !== null) {
      return set(cloneDeep(record), this.fieldpath, fieldValue);
    }
    return record;
  }

  serialize(record) {
    let fieldValue = get(record, this.fieldpath, this.serializedDefault);
    if (fieldValue !== null) {
      return set(cloneDeep(record), this.fieldpath, fieldValue);
    }
    return record;
  }
}
