const axios = require("axios");

const getCurrencies = async (req, res) => {
  try {
    await axios({
      method: "GET",
      url: "http://api.currencylayer.com/live",
      params: {
        access_key: process.env.CURRENCY_LAYER_ACCESS_KEY,
        currencies: req.body.currencies ?? "USD,AUD,CAD,PLN,PKR,INR",
        format: 1,
      },
    }).then(({ data }) => {
      if (!data.success) {
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
