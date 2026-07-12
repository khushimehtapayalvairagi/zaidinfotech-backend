import Brand from "./brand.model.js";

export const createBrandDB = async (data) => {
  return await Brand.create(data);
};

export const getBrandsDB = async () => {
  return await Brand.find({
    isDeleted: false,
  })
    .populate("category")
    .populate("createdBy", "name email");
};

export const getBrandByIdDB = async (id) => {
  return await Brand.findOne({
    _id: id,
    isDeleted: false,
  }).populate("category");
};

export const getBrandByNameDB = async (name) => {
  return await Brand.findOne({
    name,
    isDeleted: false,
  });
};

export const updateBrandDB = async (id, data) => {
  return await Brand.findByIdAndUpdate(id, data, {
    new: true,
  });
};

export const deleteBrandDB = async (id) => {
  return await Brand.findByIdAndUpdate(
    id,
    {
      isDeleted: true,
    },
    {
      new: true,
    }
  );
};