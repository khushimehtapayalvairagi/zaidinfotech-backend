import Inventory from "./inventory.model.js";

// =======================================
// CREATE INVENTORY
// =======================================

export const createInventory = async (data) => {
  return await Inventory.create(data);
};

// =======================================
// GET ALL INVENTORY
// =======================================

export const getAllInventory = async () => {

    return await Inventory.find()

        .populate({
            path: "product",
            populate: [
                {
                    path: "brand",
                    select: "name"
                },
                {
                    path: "category",
                    select: "name"
                }
            ]
        })

        .sort({
            createdAt: -1
        });

};

// =======================================
// GET INVENTORY BY ID
// =======================================

export const getInventoryById = async (id) => {
  return await Inventory.findOne({
    _id: id,
    isDeleted: false,
  })

    .populate(
      "product",
      "name sku images pricing brand category"
    )

    .populate(
      "lastUpdatedBy",
      "name firstName lastName email role"
    );
};

// =======================================
// GET INVENTORY BY PRODUCT ID
// =======================================

export const getInventoryByProductId = async (
  productId
) => {
  return await Inventory.findOne({
    product: productId,
    isDeleted: false,
  });
};

// =======================================
// UPDATE INVENTORY
// =======================================

export const updateInventory = async (
  id,
  data
) => {
  return await Inventory.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
    }
  );
};

// =======================================
// DELETE INVENTORY
// =======================================

export const deleteInventory = async (id) => {
  return await Inventory.findByIdAndUpdate(
    id,
    {
      isDeleted: true,
    },
    {
      new: true,
    }
  );
};