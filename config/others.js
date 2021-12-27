const Product = require('../models/Product');

const handleProductQuantity = (cart) => {
  cart.forEach((p) => {
    Product.updateOne(
      { _id: p._id },
      {
        $inc: {
          quantity: -p.quantity,
        },
      },
      (err) => {
        if (err) {
          console.log(err.message);
        } else {
          console.log('success');
        }
      }
    );
  });
};

module.exports = {
  handleProductQuantity,
};
