import {
  createBrandDB,
  getBrandsDB,
  getBrandByIdDB,
  getBrandByNameDB,
  updateBrandDB,
  deleteBrandDB,
} from "./brand.repository.js";

// ======================================================
// HELPERS
// ======================================================

const createSlug = (name) => {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
};

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// ======================================================
// CREATE BRAND
// ======================================================

export const createBrandService = async (data, userId) => {
  const name = String(data.name || "").trim();

  if (!name) {
    throw createError("Brand name is required.");
  }

  if (!data.category) {
    throw createError("Brand category is required.");
  }

  const exist = await getBrandByNameDB(name);

  if (exist) {
    throw createError("Brand already exists.", 409);
  }

  const payload = {
    ...data,
    name,
    createdBy: userId,
    slug: createSlug(name),
  };

  return await createBrandDB(payload);
};

// ======================================================
// GET ALL BRANDS
// ======================================================

export const getBrandsService = async () => {
  return await getBrandsDB();
};

// ======================================================
// GET BRAND BY ID
// ======================================================

export const getBrandService = async (id) => {
  return await getBrandByIdDB(id);
};

// ======================================================
// UPDATE BRAND
// ======================================================

export const updateBrandService = async (id, data) => {
  const existingBrand = await getBrandByIdDB(id);

  if (!existingBrand) {
    return null;
  }

  const payload = { ...data };

  if (payload.name !== undefined) {
    const name = String(payload.name).trim();

    if (!name) {
      throw createError("Brand name cannot be empty.");
    }

    const duplicate = await getBrandByNameDB(name);

    if (duplicate && String(duplicate._id) !== String(id)) {
      throw createError("Brand already exists.", 409);
    }

    payload.name = name;
    payload.slug = createSlug(name);
  }

  if (payload.category !== undefined && !payload.category) {
    throw createError("Brand category is required.");
  }

  if (payload.logo !== undefined) {
    if (typeof payload.logo !== "string" || !payload.logo.trim()) {
      delete payload.logo;
    }
  }

  return await updateBrandDB(id, payload);
};

// ======================================================
// DELETE BRAND
// ======================================================

export const deleteBrandService = async (id) => {
  return await deleteBrandDB(id);
};