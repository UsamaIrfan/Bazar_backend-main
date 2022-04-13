const Category = require('../models/Category');
const asyncHandler = require('../middleware/async');

const addCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.create(req.body)
  res.status(200).json({ category })
});

const addAllCategory = asyncHandler(async (req, res) => {
  const categories = await Category.insertMany(req.body);
  res.status(200).send({
    message: 'Category Added successfully!',
    categories,
  });

});

const getAllCategory = asyncHandler(async (req, res) => {
  const query = req.query;
  const categories = await Category.find({ ...query }).sort({ _id: -1 });
  res.send(categories);
});

const getCategoryById = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  res.send(category);
});


const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      category.parent = req.body.parent;
      // category.slug = req.body.slug;
      category.type = req.body.type;
      category.icon = req.body.icon;
      category.children = req.body.children;
      await category.save();
      res.send({ message: 'Category Updated Successfully!' });
    }
  } catch (err) {
    res.status(404).send({ message: 'Category not found!' });
  }
};

const updateStatus = (req, res) => {
  const newStatus = req.body.status;

  Category.updateOne(
    { _id: req.params.id },
    {
      $set: {
        status: newStatus,
      },
    },
    (err) => {
      if (err) {
        res.status(500).send({
          message: err.message,
        });
      } else {
        res.status(200).send({
          message: `Category ${newStatus} Successfully!`,
        });
      }
    }
  );
};

const deleteCategory = (req, res) => {
  Category.deleteOne({ _id: req.params.id }, (err) => {
    if (err) {
      res.status(500).send({
        message: err.message,
      });
    } else {
      res.status(200).send({
        message: 'Category Deleted Successfully!',
      });
    }
  });
};

module.exports = {
  addCategory,
  addAllCategory,
  getAllCategory,
  getCategoryById,
  updateCategory,
  updateStatus,
  deleteCategory,
};
