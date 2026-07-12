import {
  createBrandDB,
  getBrandsDB,
  getBrandByIdDB,
  getBrandByNameDB,
  updateBrandDB,
  deleteBrandDB,
} from "./brand.repository.js";

export const createBrandService = async (data, userId) => {
  const exist = await getBrandByNameDB(data.name);

  if (exist) {
    throw new Error("Brand already exists");
  }

  data.createdBy = userId;

  data.slug = data.name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");

  return await createBrandDB(data);
};

export const getBrandsService = async () => {
  return await getBrandsDB();
};

export const getBrandService = async (id) => {
  return await getBrandByIdDB(id);
};

export const updateBrandService = async (id, data) => {
  if (data.name) {
    data.slug = data.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-");
  }

  return await updateBrandDB(id, data);
};

export const deleteBrandService = async (id) => {
  return await deleteBrandDB(id);
};