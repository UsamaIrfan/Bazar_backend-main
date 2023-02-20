const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const categorySchema = new mongoose.Schema({
  parent: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: false,
  },
  type: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  children: [{}],
  status: {
    type: String,
    enum: ["Show", "Hide"],
    default: "Show",
  },
});

categorySchema.plugin(mongoosePaginate)

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
