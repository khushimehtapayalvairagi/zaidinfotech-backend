import {
  adjustRentalStockService,
} from "./rentalStock.service.js";

export const adjustRentalStockController = async (
  req,
  res
) => {
  try {
    const result = await adjustRentalStockService(
      req.params.productId,
      req.body || {},
      req.user?._id || req.user?.id || null
    );

    return res.status(200).json({
      success: true,
      message:
        result.action === "ADD"
          ? "Rental stock added successfully"
          : "Rental stock removed successfully",
      data: result,
    });
  } catch (error) {
    console.error(
      "ADJUST RENTAL STOCK ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to update rental stock",
    });
  }
};