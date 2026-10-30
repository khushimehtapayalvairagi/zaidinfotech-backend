import mongoose from "mongoose";
import RentalProduct from "./rentalProduct.model.js";

const parseQuantity = (value) => {
  const quantity = Number(value);

  if (
    !Number.isSafeInteger(quantity) ||
    quantity <= 0
  ) {
    throw new Error(
      "Quantity must be a positive whole number"
    );
  }

  return quantity;
};

export const adjustRentalStockService = async (
  productId,
  data = {},
  userId = null
) => {
  if (!mongoose.isValidObjectId(productId)) {
    throw new Error("Invalid product ID");
  }

  const action = String(data.action || "")
    .trim()
    .toUpperCase();

  if (!["ADD", "REMOVE"].includes(action)) {
    throw new Error(
      "Action must be ADD or REMOVE"
    );
  }

  const quantity = parseQuantity(data.quantity);

  // productId refers to Product._id,
  // not RentalProduct._id.
  const rentalProduct = await RentalProduct.findOne({
    productId,
  });

  if (!rentalProduct) {
    throw new Error(
      "Rental product configuration not found"
    );
  }

  const previousStock = {
    totalQuantity: Number(
      rentalProduct.totalQuantity || 0
    ),
    availableQuantity: Number(
      rentalProduct.availableQuantity || 0
    ),
    rentedQuantity: Number(
      rentalProduct.rentedQuantity || 0
    ),
  };

  if (
    previousStock.totalQuantity !==
    previousStock.availableQuantity +
      previousStock.rentedQuantity
  ) {
    throw new Error(
      "Rental stock quantities are inconsistent. Please reconcile inventory before updating."
    );
  }

  // Atomic update:
  // REMOVE is allowed only when enough stock is available.
  const filter = {
    _id: rentalProduct._id,
    totalQuantity: previousStock.totalQuantity,
    availableQuantity:
      previousStock.availableQuantity,
    rentedQuantity: previousStock.rentedQuantity,
  };

  if (action === "REMOVE") {
    filter.availableQuantity = {
      $gte: quantity,
      $eq: previousStock.availableQuantity,
    };
  }

  const delta =
    action === "ADD" ? quantity : -quantity;

  const updated = await RentalProduct.findOneAndUpdate(
    filter,
    {
      $inc: {
        totalQuantity: delta,
        availableQuantity: delta,
      },
      ...(userId
        ? { $set: { updatedBy: userId } }
        : {}),
    },
    {
      new: true,
      runValidators: true,
    }
  ).populate("productId");

  if (!updated) {
    throw new Error(
      "Stock changed or insufficient available stock. Refresh and try again."
    );
  }

  return {
    action,
    quantity,
    productId,
    rentalProductId: updated._id,
    product: updated.productId,
    previousStock,
    updatedStock: {
      totalQuantity: updated.totalQuantity,
      availableQuantity: updated.availableQuantity,
      rentedQuantity: updated.rentedQuantity,
    },
    updatedBy: userId,
  };
};