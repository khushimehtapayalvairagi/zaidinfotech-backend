import mongoose from "mongoose";
import Category from "./category.model.js";

import {
  createCategoryDB,
  getCategoriesDB,
  getCategoryByIdDB,
  updateCategoryDB,
  deleteCategoryDB,
} from "./category.repository.js";

// ======================================================
// ERROR HELPER
// ======================================================

const makeError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// ======================================================
// SLUG HELPER
// ======================================================

const generateSlug = (name) => {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
};

// ======================================================
// VALIDATE PARENT CATEGORY
// ======================================================

const validateParentCategory = async (
  parentId,
  currentCategoryId = null
) => {
  if (
    parentId === undefined ||
    parentId === null ||
    parentId === ""
  ) {
    return null;
  }

  if (!mongoose.isValidObjectId(parentId)) {
    throw makeError("Invalid parent category ID.");
  }

  if (
    currentCategoryId &&
    String(parentId) === String(currentCategoryId)
  ) {
    throw makeError(
      "Category cannot be its own parent."
    );
  }

  const parent = await Category.findOne({
    _id: parentId,
    isDeleted: false,
  });

  if (!parent) {
    throw makeError("Parent category not found.", 404);
  }

  if (parent.status !== "ACTIVE") {
    throw makeError("Parent category is inactive.");
  }

  // Prevent assigning a subcategory as a parent.
  if (parent.parentCategory) {
    throw makeError(
      "Please select a main category as parent."
    );
  }

  return parent._id;
};

// ======================================================
// CREATE CATEGORY
// ======================================================

export const createCategoryService = async (
  data,
  userId
) => {
  const name = String(data.name || "").trim();

  if (!name) {
    throw makeError("Category name is required.");
  }

  const parentCategory = await validateParentCategory(
    data.parentCategory
  );

  const categoryData = {
    name,
    slug: generateSlug(name),
    description: data.description || "",
    image: data.image || "",
    parentCategory,
    createdBy: userId,
  };

  if (data.status !== undefined) {
    categoryData.status = data.status;
  }

  if (data.sortOrder !== undefined) {
    const sortOrder = Number(data.sortOrder);

    if (!Number.isFinite(sortOrder)) {
      throw makeError("Invalid sort order.");
    }

    categoryData.sortOrder = sortOrder;
  }

  return await createCategoryDB(categoryData);
};

// ======================================================
// GET ALL CATEGORIES
// ======================================================

export const getCategoriesService = async () => {
  return await getCategoriesDB();
};

// ======================================================
// GET CATEGORY BY ID
// ======================================================

export const getCategoryService = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw makeError("Invalid category ID.");
  }

  return await getCategoryByIdDB(id);
};

// ======================================================
// UPDATE CATEGORY
// ======================================================

export const updateCategoryService = async (
  id,
  data
) => {
  if (!mongoose.isValidObjectId(id)) {
    throw makeError("Invalid category ID.");
  }

  const existingCategory = await Category.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!existingCategory) {
    throw makeError("Category not found.", 404);
  }

  const updateData = {};

  // ----------------------------
  // NAME + SLUG
  // ----------------------------

  if (data.name !== undefined) {
    const name = String(data.name).trim();

    if (!name) {
      throw makeError("Category name is required.");
    }

    updateData.name = name;
    updateData.slug = generateSlug(name);
  }

  // ----------------------------
  // DESCRIPTION
  // ----------------------------

  if (data.description !== undefined) {
    updateData.description = String(
      data.description || ""
    );
  }

  // ----------------------------
  // IMAGE
  // ----------------------------

  if (data.image !== undefined) {
    updateData.image = String(data.image || "");
  }

  // ----------------------------
  // PARENT CATEGORY
  // ----------------------------

  if (data.parentCategory !== undefined) {
    const parentCategory =
      await validateParentCategory(
        data.parentCategory,
        id
      );

    // Prevent converting a parent with children
    // into a subcategory.
    if (parentCategory) {
      const hasChildren = await Category.exists({
        parentCategory: id,
        isDeleted: false,
      });

      if (hasChildren) {
        throw makeError(
          "Move existing subcategories before changing this category's parent."
        );
      }
    }

    updateData.parentCategory = parentCategory;
  }

  // ----------------------------
  // STATUS
  // ----------------------------

  if (data.status !== undefined) {
    const status = String(data.status)
      .trim()
      .toUpperCase();

    if (!["ACTIVE", "INACTIVE"].includes(status)) {
      throw makeError("Invalid category status.");
    }

    // Prevent inactive parent with active children.
    if (status === "INACTIVE") {
      const activeChild = await Category.exists({
        parentCategory: id,
        status: "ACTIVE",
        isDeleted: false,
      });

      if (activeChild) {
        throw makeError(
          "Please deactivate active subcategories first."
        );
      }
    }

    updateData.status = status;
  }

  // ----------------------------
  // SORT ORDER
  // ----------------------------

  if (data.sortOrder !== undefined) {
    const sortOrder = Number(data.sortOrder);

    if (
      data.sortOrder === "" ||
      !Number.isFinite(sortOrder)
    ) {
      throw makeError("Invalid sort order.");
    }

    updateData.sortOrder = sortOrder;
  }

  if (Object.keys(updateData).length === 0) {
    throw makeError("No valid fields to update.");
  }

  return await updateCategoryDB(id, updateData);
};

// ======================================================
// DELETE CATEGORY
// ======================================================

export const deleteCategoryService = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw makeError("Invalid category ID.");
  }

  const category = await Category.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!category) {
    throw makeError("Category not found.", 404);
  }

  const hasChildren = await Category.exists({
    parentCategory: id,
    isDeleted: false,
  });

  if (hasChildren) {
    throw makeError(
      "Delete or move subcategories before deleting this category."
    );
  }

  return await deleteCategoryDB(id);
};