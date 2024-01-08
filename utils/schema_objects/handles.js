const {
  product_and_subcategory,
  Product_Field_Schema_dto,
  additional_for_product,
  additional_for_sub_category,
  Sub_Category_Field_Schema_dto,
} = require("./schema_objects");

const product_schema_handle = () => {
  let data_sch = {};
  Object.keys(product_and_subcategory).map((elem) => {
    // console.log({ elem: product_and_subcategory[elem] });
    const product_obj = new Product_Field_Schema_dto(
      product_and_subcategory[elem]
    );
    // console.log({ ...product_obj });
    data_sch = { ...data_sch, [elem]: { ...product_obj } };
  });
  return { ...data_sch, ...additional_for_product };
};

const sub_category_schema_handle = () => {
  let data_sch = {};
  Object.keys(product_and_subcategory).map((elem) => {
    // console.log(product_and_subcategory[elem]);
    const product_obj = new Sub_Category_Field_Schema_dto(
      product_and_subcategory[elem]
    );
    data_sch = { ...data_sch, [elem]: product_obj };
  });
  return { ...data_sch, ...additional_for_sub_category };
};

const create_post_node_object = (fields_obj, body, sub_cat) => {
  const require_fields = Object.keys(fields_obj);

  let obj = {}

  require_fields.map((elem) => {
    if (fields_obj[elem].has_input_type && sub_cat) {
      obj[elem] = {
        type: fields_obj[elem].input_type,
        is_applicable: body[elem],
      };
    } else {
      obj[elem] = body[elem]
    }
  });

  return obj
};

module.exports = {
  sub_category_schema_handle,
  product_schema_handle,
  create_post_node_object,
};
