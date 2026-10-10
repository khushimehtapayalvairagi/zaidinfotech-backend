


import mongoose from "mongoose";
import ServiceCatalog from "./service.model.js";

// ======================================================
// GET ALL SERVICE RATES
// GET /api/repair-service/get-services
// Admin, Technician, Receptionist
// ======================================================

export const getAllServices = async (req, res) => {
  try {
    const services = await ServiceCatalog.find({})
      .sort({ category: 1, serviceName: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      services,
    });
  } catch (error) {
    console.error("Get service rates error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch services",
      error: error.message,
    });
  }
};

// ======================================================
// CREATE SERVICE RATE
// POST /api/repair-service/create-service
// Admin, Technician
// ======================================================

export const createService = async (req, res) => {
  try {
    const {
      serviceName,
      category,
      partCost,
      laborCost,
      estimatedTime,
      description,
    } = req.body;

    // Validate service name
    if (
      typeof serviceName !== "string" ||
      !serviceName.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Service name is required",
      });
    }

    // Validate labour cost
    if (
      laborCost === undefined ||
      laborCost === null ||
      laborCost === "" ||
      !Number.isFinite(Number(laborCost)) ||
      Number(laborCost) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid non-negative labour cost is required",
      });
    }

    // Validate part cost
    const numPartCost =
      partCost === undefined || partCost === null || partCost === ""
        ? 0
        : Number(partCost);

    const numLaborCost = Number(laborCost);

    if (
      !Number.isFinite(numPartCost) ||
      numPartCost < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Part cost must be a valid non-negative number",
      });
    }

    const allowedCategories = [
      "Hardware Repair",
      "Hardware Replacement",
      "Software & OS",
      "Maintenance",
      "Diagnostics",
    ];

    const selectedCategory = category || "Hardware Repair";

    if (!allowedCategories.includes(selectedCategory)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service category",
      });
    }

    const newService = new ServiceCatalog({
      serviceName: serviceName.trim(),
      category: selectedCategory,
      partCost: numPartCost,
      laborCost: numLaborCost,
      totalCost: numPartCost + numLaborCost,
      estimatedTime:
        typeof estimatedTime === "string" && estimatedTime.trim()
          ? estimatedTime.trim()
          : "1-2 hours",
      description:
        typeof description === "string"
          ? description.trim()
          : "",
      createdBy: req.user?.name || "Technician",
    });

    await newService.save();

    return res.status(201).json({
      success: true,
      message: "Service rate created successfully",
      service: newService,
    });
  } catch (error) {
    console.error("Create service rate error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create service rate",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE SERVICE RATE
// PUT /api/repair-service/update-service/:id
// Admin, Technician
// ======================================================

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      serviceName,
      category,
      partCost,
      laborCost,
      estimatedTime,
      description,
    } = req.body;

    // Validate MongoDB ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID",
      });
    }

    // Validate service name
    if (
      typeof serviceName !== "string" ||
      !serviceName.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Service name is required",
      });
    }

    // Validate labour cost
    if (
      laborCost === undefined ||
      laborCost === null ||
      laborCost === "" ||
      !Number.isFinite(Number(laborCost)) ||
      Number(laborCost) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid non-negative labour cost is required",
      });
    }

    // Validate part cost
    const parsedPartCost =
      partCost === undefined || partCost === null || partCost === ""
        ? 0
        : Number(partCost);

    const parsedLaborCost = Number(laborCost);

    if (
      !Number.isFinite(parsedPartCost) ||
      parsedPartCost < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Part cost must be a valid non-negative number",
      });
    }

    // Validate category
    const allowedCategories = [
      "Hardware Repair",
      "Hardware Replacement",
      "Software & OS",
      "Maintenance",
      "Diagnostics",
    ];

    const selectedCategory = category || "Hardware Repair";

    if (!allowedCategories.includes(selectedCategory)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service category",
      });
    }

    // Update the same ServiceCatalog document.
    // Both Admin and Technician must use this API.
    const updated = await ServiceCatalog.findByIdAndUpdate(
      id,
      {
        $set: {
          serviceName: serviceName.trim(),
          category: selectedCategory,
          partCost: parsedPartCost,
          laborCost: parsedLaborCost,
          totalCost: parsedPartCost + parsedLaborCost,
          estimatedTime:
            typeof estimatedTime === "string" && estimatedTime.trim()
              ? estimatedTime.trim()
              : "1-2 hours",
          description:
            typeof description === "string"
              ? description.trim()
              : "",
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Service rate not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Service rate updated successfully",
      service: updated,
    });
  } catch (error) {
    console.error("Update service rate error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update service rate",
      error: error.message,
    });
  }
};

// ======================================================
// DELETE SERVICE RATE
// DELETE /api/repair-service/delete-service/:id
// Admin, Technician
// ======================================================

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID",
      });
    }

    const deleted = await ServiceCatalog.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Service rate not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Service rate deleted successfully",
    });
  } catch (error) {
    console.error("Delete service rate error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete service rate",
      error: error.message,
    });
  }
};