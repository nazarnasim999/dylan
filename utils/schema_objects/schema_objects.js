const mongoose = require("mongoose");

const caption_constants = {
  array: "Options",
  string: "value",
  boolean: "Select an option",
};

class Product_Field_Schema_dto {
  constructor(data) {
    this.type =
      data.input_type === "array"
        ? Array
        : data.input_type === "string"
        ? String
        : data.input_type === "boolean"
        ? Boolean
        : data.input_type === "number"
        ? Number
        : Object;
  }
}
class Sub_Category_Field_Schema_dto {
  constructor(data) {
    // this.required = true,
    (this.type = {
      type: String,
      required: true,
      default: data.input_type,
    }),
      (this.is_applicable = {
        type: Boolean,
        default: false,
        required: true,
      }),
      (this.required = true);
    this.default = {
      type: data.input_type,
      is_applicable: false,
    };
  }
}

const product_and_subcategory = {
  // seller_id: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   required:true,
  // },
  title: {
    type: Boolean,
    required: true,
    default: false,
    input_type: "string",
  },
  size: {
    type: Boolean,
    required: true,
    default: false,
    input_type: "array",
  },
  color: {
    type: Boolean,
    required: true,
    default: false,
    input_type: "array",
  },
  description: {
    type: Boolean,
    required: true,
    default: false,
    input_type: "string",
  },

  images: {
    type: Boolean,
    required: true,
    default: false,
    input_type: "array",
  },
  features: {
    type: Boolean,
    required: true,
    default: false,
    input_type: "array",
  },
  feature_image: {
    type: Boolean,
    required: true,
    default: false,
    input_type: "number",
  },
  // festure_image: {
  //   type: Boolean,
  //   required: true,
  //   default: false,
  //   input_type: "number",
  // },
  price: {
    type: String,
    required: true,
    default: false,
    input_type: "string",
  },
  // currency: {
  //   type: String,
  //   required: true,
  //   default: false,
  //   input_type: "string",
  // },
  in_stock: {
    type: Boolean,
    required: true,
    default: false,
    input_type: "boolean",
  },
};

const additional_for_product = {
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  sub_category_title: {
    type: String,
    required: true,
  },
  sub_category_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
};
const additional_for_sub_category = {
  sub_category_title: {
    type: String,
    required: true,
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
};

module.exports = {
  Product_Field_Schema_dto,
  Sub_Category_Field_Schema_dto,
  product_and_subcategory,
  additional_for_product,
  additional_for_sub_category,
  caption_constants,
};
