require("dotenv").config();

const {
  PORT,
  MONGODB_URI,
  ACCESS_TOKEN_SECRET,

} = process.env;

module.exports = {
  PORT,
  MONGODB_URI,
  ACCESS_TOKEN_SECRET,

};
