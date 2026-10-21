import Category from "./category.model.js";

// ======================================================
// CREATE CATEGORY
// ======================================================

export const createCategoryDB = async (data) => {
  return await Category.create(data);
};

// ======================================================
// GET ALL CATEGORIES
// ======================================================

export const getCategoriesDB = async () => {
  return await Category.find({
    isDeleted: false,
  })
    .populate("parentCategory")
    .sort({
      sortOrder: 1,
      createdAt: -1,
    });
};

// ======================================================
// GET CATEGORY BY ID
// ======================================================

export const getCategoryByIdDB = async (id) => {
  return await Category.findOne({
    _id: id,
    isDeleted: false,
  }).populate("parentCategory");
};

// ======================================================
// UPDATE CATEGORY
// ======================================================

export const updateCategoryDB = async (id, data) => {
  return await Category.findOneAndUpdate(
    {
      _id: id,
      isDeleted: false,
    },
    {
      $set: data,
    },
    {
      new: true,
      runValidators: true,
    }
  ).populate("parentCategory");
};

// ======================================================
// DELETE CATEGORY (SOFT DELETE)
// ======================================================

export const deleteCategoryDB = async (id) => {
  return await Category.findOneAndUpdate(
    {
      _id: id,
      isDeleted: false,
    },
    {
      $set: {
        isDeleted: true,
      },
    },
    {
      new: true,
    }
  );
};