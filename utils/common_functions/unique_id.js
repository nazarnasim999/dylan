const unique_id = () => {
  const today = new Date();
  return today.getTime().toString();
};

module.exports = { unique_id };
