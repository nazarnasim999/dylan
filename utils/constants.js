const user_type_constant = {
  ADMIN: "admin",
  SELLER: "seller",
  BUYER: "buyer",
  BUSINESS_PARTNER: "business_partner",
};
const status_type_constant = {
  REQUESTED: "requested",
  APPROVED: "approved",
  COUNTER_OFFER: "counter_offer",
  REJECTED: "rejected",
};

const exception_routes = [];

module.exports = { user_type_constant, exception_routes, status_type_constant };
