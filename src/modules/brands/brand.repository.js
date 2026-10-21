import Brand from "./brand.model.js";

// ======================================================
// CREATE BRAND
// ======================================================

export const createBrandDB = async (data) => {
  return await Brand.create(data);
};

// ======================================================
// GET ALL BRANDS
// ======================================================

export const getBrandsDB = async () => {
  return await Brand.find({
    isDeleted: false,
  })
    .populate("category")
    .populate("createdBy", "name email");
};

// ======================================================
// GET BRAND BY ID
// ======================================================

export const getBrandByIdDB = async (id) => {
  return await Brand.findOne({
    _id: id,
    isDeleted: false,
  }).populate("category");
};

// ======================================================
// GET BRAND BY NAME
// ======================================================

export const getBrandByNameDB = async (name) => {
  return await Brand.findOne({
    name,
    isDeleted: false,
  });
};

// ======================================================
// UPDATE BRAND
// ======================================================

export const updateBrandDB = async (id, data) => {
  return await Brand.findOneAndUpdate(
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
  );
};

// ======================================================
// DELETE BRAND
// SOFT DELETE
// ======================================================

export const deleteBrandDB = async (id) => {
  return await Brand.findOneAndUpdate(
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