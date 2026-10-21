import mongoose from "mongoose";

// ======================================================
// CATEGORY SCHEMA
// ======================================================

const categorySchema = new mongoose.Schema(
  {
    // --------------------------------------------------
    // CATEGORY NAME
    // --------------------------------------------------
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // --------------------------------------------------
    // CATEGORY SLUG
    // --------------------------------------------------
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // --------------------------------------------------
    // CATEGORY IMAGE
    // Store image path as STRING, not File object
    // --------------------------------------------------
    image: {
      type: String,
      default: "",
    },

    // --------------------------------------------------
    // DESCRIPTION
    // --------------------------------------------------
    description: {
      type: String,
      default: "",
    },

    // --------------------------------------------------
    // PARENT CATEGORY
    // --------------------------------------------------
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    // --------------------------------------------------
    // CATEGORY STATUS
    // --------------------------------------------------
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },

    // --------------------------------------------------
    // SORT ORDER
    // --------------------------------------------------
    sortOrder: {
      type: Number,
      default: 0,
    },

    // --------------------------------------------------
    // SOFT DELETE
    // --------------------------------------------------
    isDeleted: {
      type: Boolean,
      default: false,
    },

    // --------------------------------------------------
    // CREATED BY
    // --------------------------------------------------
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ======================================================
// MODEL
// ======================================================

const Category = mongoose.model(
  "Category",
  categorySchema
);

export default Category;