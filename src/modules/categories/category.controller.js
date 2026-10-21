import {
  createCategoryService,
  getCategoriesService,
  getCategoryService,
  updateCategoryService,
  deleteCategoryService,
} from "./category.services.js";

// ======================================================
// ERROR RESPONSE HELPER
// ======================================================

const handleError = (res, error) => {
  console.error("CATEGORY ERROR:", error);

  let statusCode = error.statusCode || 500;

  if (
    error.name === "ValidationError" ||
    error.name === "CastError"
  ) {
    statusCode = 400;
  }

  if (error.code === 11000) {
    statusCode = 409;
  }

  return res.status(statusCode).json({
    success: false,
    message:
      error.code === 11000
        ? "Category slug already exists. Please use a different name."
        : error.message || "Internal server error.",
  });
};

// ======================================================
// PREPARE CATEGORY DATA
//
// IMPORTANT:
// MongoDB image field is String.
// Never send image File object or {} to MongoDB.
// ======================================================

const prepareCategoryData = (req) => {
  const data = {
    ...(req.body || {}),
  };

  // --------------------------------------------------
  // CASE 1: NEW IMAGE UPLOADED
  // --------------------------------------------------

  if (req.file) {
    if (!req.file.filename) {
      const error = new Error(
        "Image upload failed: filename not found."
      );

      error.statusCode = 400;
      throw error;
    }

    data.image =
      `/uploads/categories/${req.file.filename}`;
  }

  // --------------------------------------------------
  // CASE 2: NO NEW IMAGE
  // --------------------------------------------------

  else {
    // Do not overwrite the existing image.
    // Also prevents image: {} MongoDB cast error.
    delete data.image;
  }

  return data;
};

// ======================================================
// CREATE CATEGORY / SUBCATEGORY
// ======================================================

export const createCategory = async (req, res) => {
  try {
    const data = prepareCategoryData(req);

    console.log("CREATE CATEGORY DATA:", data);
    console.log(
      "CREATE CATEGORY IMAGE:",
      req.file?.filename || "No image uploaded"
    );

    const category = await createCategoryService(
      data,
      req.user.id
    );

    return res.status(201).json({
      success: true,
      message: "Category Created Successfully",
      data: category,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// ======================================================
// GET ALL CATEGORIES
// ======================================================

export const getCategories = async (req, res) => {
  try {
    const categories = await getCategoriesService();

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// ======================================================
// GET CATEGORY BY ID
// ======================================================

export const getCategory = async (req, res) => {
  try {
    const category = await getCategoryService(
      req.params.id
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// ======================================================
// UPDATE CATEGORY / SUBCATEGORY
//
// Supports:
// - Name
// - Description
// - Image
// - Parent Category
// - Status
// - Sort Order
// ======================================================

export const updateCategory = async (req, res) => {
  try {
    const data = prepareCategoryData(req);

    console.log("================================");
    console.log("UPDATE CATEGORY ID:", req.params.id);
    console.log("UPDATE CATEGORY DATA:", data);
    console.log(
      "UPDATE CATEGORY IMAGE:",
      req.file?.filename || "No new image uploaded"
    );
    console.log("================================");

    const category = await updateCategoryService(
      req.params.id,
      data
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category Updated Successfully",
      data: category,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// ======================================================
// DELETE CATEGORY / SUBCATEGORY
// ======================================================

export const deleteCategory = async (req, res) => {
  try {
    const category = await deleteCategoryService(
      req.params.id
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category Deleted Successfully",
    });
  } catch (error) {
    return handleError(res, error);
  }
};