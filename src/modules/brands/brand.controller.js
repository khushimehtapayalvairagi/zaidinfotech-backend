import {
  createBrandService,
  getBrandsService,
  getBrandService,
  updateBrandService,
  deleteBrandService,
} from "./brand.service.js";

// ======================================================
// ERROR HANDLER
// ======================================================

const handleBrandError = (res, error) => {
  console.error("BRAND ERROR:", error);

  let statusCode = error.statusCode || 500;

  if (
    error.name === "ValidationError" ||
    error.name === "CastError" ||
    error.name === "MulterError"
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
        ? "Brand name or slug already exists."
        : error.message || "Internal server error.",
  });
};

// ======================================================
// PREPARE BRAND DATA
// ======================================================

const prepareBrandData = (req) => {
  const data = { ...(req.body || {}) };

  // Do not allow invalid logo objects.
  // Existing logo remains unchanged on update.
  delete data.logo;

  // New uploaded logo.
  if (req.file) {
    if (!req.file.filename) {
      const error = new Error(
        "Logo upload failed: filename not found."
      );

      error.statusCode = 400;
      throw error;
    }

    data.logo = `/uploads/brands/${req.file.filename}`;
  }

  // Normalize category.
  if (
    data.category &&
    typeof data.category === "object"
  ) {
    data.category =
      data.category._id ||
      data.category.id ||
      "";
  }

  return data;
};

// ======================================================
// CREATE BRAND
// ======================================================

export const createBrand = async (req, res) => {
  try {
    console.log("========== CREATE BRAND ==========");

    console.log("BODY:", req.body);

    console.log(
      "FILE:",
      req.file
        ? {
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
          }
        : "NO FILE RECEIVED"
    );

    const data = prepareBrandData(req);

    const brand = await createBrandService(
      data,
      req.user.id
    );

    return res.status(201).json({
      success: true,
      message: "Brand Created Successfully",
      data: brand,
    });
  } catch (error) {
    return handleBrandError(res, error);
  }
};

// ======================================================
// GET ALL BRANDS
// ======================================================

export const getBrands = async (req, res) => {
  try {
    const brands = await getBrandsService();

    return res.status(200).json({
      success: true,
      data: brands,
    });
  } catch (error) {
    return handleBrandError(res, error);
  }
};

// ======================================================
// GET BRAND BY ID
// ======================================================

export const getBrand = async (req, res) => {
  try {
    const brand = await getBrandService(
      req.params.id
    );

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: brand,
    });
  } catch (error) {
    return handleBrandError(res, error);
  }
};

// ======================================================
// UPDATE BRAND
// ======================================================

export const updateBrand = async (req, res) => {
  try {
    console.log("========== UPDATE BRAND ==========");

    console.log("BRAND ID:", req.params.id);

    console.log(
      "CONTENT TYPE:",
      req.headers["content-type"]
    );

    console.log("REQUEST BODY:", req.body);

    console.log(
      "UPLOADED FILE:",
      req.file
        ? {
            fieldname: req.file.fieldname,
            filename: req.file.filename,
            originalname: req.file.originalname,
            path: req.file.path,
            mimetype: req.file.mimetype,
            size: req.file.size,
          }
        : "NO FILE RECEIVED"
    );

    // Prepare all fields.
    const data = prepareBrandData(req);

    console.log("DATA TO UPDATE:", data);

    // Update database.
    const brand = await updateBrandService(
      req.params.id,
      data
    );

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found.",
      });
    }

    console.log(
      "SAVED BRAND LOGO:",
      brand.logo
    );

    console.log(
      "========== UPDATE COMPLETE =========="
    );

    return res.status(200).json({
      success: true,
      message: "Brand Updated Successfully",
      data: brand,
    });
  } catch (error) {
    return handleBrandError(res, error);
  }
};

// ======================================================
// DELETE BRAND
// ======================================================

export const deleteBrand = async (req, res) => {
  try {
    const brand = await deleteBrandService(
      req.params.id
    );

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Brand Deleted Successfully",
      data: brand,
    });
  } catch (error) {
    return handleBrandError(res, error);
  }
};