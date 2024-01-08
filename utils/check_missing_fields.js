const check_missing_fields = (required_fields, req_body) => {
  const body_keys = Object.keys(req_body);
  const missing_fields = [];

  required_fields.forEach((element) => {
    const field_val = req_body[element];
    if (
      !body_keys.includes(element) ||
      field_val === undefined ||
      field_val === ""
    ) {
      missing_fields.push(element);
    }
  });
  return missing_fields;
};

const create_required_fields = (fields_obj) => {
  let keys = Object.keys(fields_obj);
  let obj = {};

  keys.map((elem) => {
    if (fields_obj[elem].input_type) {
      obj[elem] = {
        has_input_type: true,
        input_type: fields_obj[elem].input_type,
      };
    } else {
      obj[elem] = {
        has_input_type: false,
        input_type: fields_obj[elem].input_type,
      };
    }
  });
  return { keys, obj };
};
module.exports = { check_missing_fields, create_required_fields };
