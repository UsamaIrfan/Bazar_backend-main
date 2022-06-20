const axios = require("axios");

const getCurrencies = async (req, res) => {
  try {
    const { currency } = req.query;
    await axios({
      method: "GET",
      url: `https://open.er-api.com/v6/latest/${currency ? currency : "PKR"}`,
    }).then(({ data }) => {
      if (!data) {
        throw Error("Couldn't get currency data.");
      }

      res.send(data);
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

module.exports = {
  getCurrencies,
};
