// import * as repairService from "./repair.service.js"
// import User from '../users/user.model.js'
// // Create Repair Request
// export const createRepair = async (req, res, next) => {
//   try {
//     const repair = await repairService.createRepair(req.body);

//     return res.status(201).json({
//       success: true,
//       message: "Repair request created successfully.",
//       data: repair,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Get All Repair Requests
// export const getAllRepairs = async (req, res, next) => {
//   try {
//     const repairs = await repairService.getAllRepairs();

//     return res.status(200).json({
//       success: true,
//       count: repairs.length,
//       data: repairs,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Get Repair By Id
// export const getRepairById = async (req, res, next) => {
//   try {
//     const repair = await repairService.getRepairById(req.params.id);

//     return res.status(200).json({
//       success: true,
//       data: repair,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Get Repairs By User
// export const getRepairsByUser = async (req, res, next) => {
//   try {
//     const repairs = await repairService.getRepairsByUser(req.params.userId);

//     return res.status(200).json({
//       success: true,
//       count: repairs.length,
//       data: repairs,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Get Repairs By Product
// export const getRepairsByProduct = async (req, res, next) => {
//   try {
//     const repairs = await repairService.getRepairsByProduct(
//       req.params.productId
//     );

//     return res.status(200).json({
//       success: true,
//       count: repairs.length,
//       data: repairs,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Update Repair Details
// export const updateRepair = async (req, res, next) => {
//   try {
//     const repair = await repairService.updateRepair(
//       req.params.id,
//       req.body
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Repair updated successfully.",
//       data: repair,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Update Repair Status
// export const updateRepairStatus = async (req, res, next) => {
//   try {
//     const { status } = req.body;

//     const repair = await repairService.updateRepairStatus(
//       req.params.id,
//       status
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Repair status updated successfully.",
//       data: repair,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Mark Repair Delivered
// export const markDelivered = async (req, res, next) => {
//   try {
//     const repair = await repairService.markDelivered(req.params.id);

//     return res.status(200).json({
//       success: true,
//       message: "Repair marked as delivered successfully.",
//       data: repair,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Delete Repair Request
// export const deleteRepair = async (req, res, next) => {
//   try {
//     await repairService.deleteRepair(req.params.id);

//     return res.status(200).json({
//       success: true,
//       message: "Repair request deleted successfully.",
//     });
//   } catch (error) {
//     next(error);
//   }
// };




// export const getMyAssignedRepairs = async (req, res, next) => {
//   try {
//     const technicianId = req.user._id || req.user.id;
//     const repairs = await repairService.getRepairsByTechnician(technicianId);
//     return res.status(200).json({ success: true, count: repairs.length, data: repairs });
//   } catch (error) {
//     next(error);
//   }
// };

// // ======================================================
// // ADD REPAIR PART
// // ======================================================

// export const addRepairPart = async (
//   req,
//   res,
//   next
// ) => {

//   try {

//     const {
//       productId,
//       quantity
//     } = req.body;

//     const repair =
//       await repairService.addRepairPart(
//         req.params.id,
//         productId,
//         quantity,
//         req.user.id
//       );

//     return res.status(200).json({

//       success: true,

//       message:
//         "Spare part added successfully and inventory updated",

//       data: repair,

//     });

//   }
//   catch (error) {

//     next(error);

//   }

// };




// export const getTechniciansList = async (req, res) => {
//   try {
//     const technicians = await User.find(
//       { role: "TECHNICIAN" }
//     );

//     console.log("TECHNICIANS:", technicians);

//     return res.status(200).json({
//       success: true,
//       technicians,
//     });
//   } catch (error) {
//     console.error("GET TECHNICIANS ERROR:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// export const getTechnicianProfile = async (req, res) => {
//   try {
//     const userId = req.user?._id || req.user?.id;

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: "User not authenticated.",
//       });
//     }

//     // req.user was already found in your verifyToken middleware
//     // We select name, email, and phone
//     const user = await User.findById(userId).select("name email phone");

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "Technician not found in database.",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: {
//         name: user.name || "",
//         email: user.email || "",
//         phone: user.phone || "",
//       },
//     });
//   } catch (error) {
//     console.error("GET Profile Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Internal server error fetching profile.",
//     });
//   }
// };

// // UPDATE Profile Details (Phone, Name, Email)
// export const updateTechnicianProfile = async (req, res) => {
//   try {
//     const { name, phone, email } = req.body;

//     const updatedUser = await User.findByIdAndUpdate(
//       req.user.id || req.user._id,
//       { $set: { name, phone, email } },
//       { new: true, runValidators: true }
//     ).select("-password");

//     return res.status(200).json({
//       success: true,
//       message: "Profile updated successfully.",
//       data: updatedUser,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });

//   }
// };



// // CHANGE\ Password
// export const changePassword = async (req, res) => {
//   try {
//     const { currentPassword, newPassword } = req.body;

//     // 1. Check if both fields were provided
//     if (!currentPassword || !newPassword) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide both current and new passwords.",
//       });
//     }

//     // 2. Fetch password directly if excluded by default in schema
//     const user = await User.findById(req.user._id).select("+password");

//     // 3. Verify current password
//     const isMatch = await bcrypt.compare(currentPassword, user.password);
//     if (!isMatch) {
//       return res.status(400).json({
//         success: false,
//         message: "Current password is incorrect.",
//       });
//     }

//     // 4. Hash and update
//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(newPassword, salt);
//     await user.save();

//     return res.status(200).json({
//       success: true,
//       message: "Password changed successfully.",
//     });
//   } catch (error) {
//     console.error("Change password error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error changing password",
//       error: error.message,
//     });
//   }
// };

// // =====================================================
// // UPDATE REPAIR PAYMENT
// // =====================================================

// export const updateRepairPayment = async (req, res, next) => {
//   try {
//     const { paidAmount, paymentMethod, paymentId, paymentStatus } =
//       req.body;

//     const repair = await repairService.updateRepairPayment(
//       req.params.id,
//       {
//         paidAmount,
//         paymentMethod,
//         paymentId,
//         paymentStatus,
//       }
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Repair payment updated successfully.",
//       data: repair,
//     });
//   } catch (error) {
//     next(error);
//   }
// };


import bcrypt from "bcryptjs";

import * as repairService from "./repair.service.js";

import User from "../users/user.model.js";

// ======================================================
// CREATE REPAIR REQUEST
// ======================================================

export const createRepair = async (
  req,
  res,
  next
) => {
  try {
    console.log(
      "=========================================="
    );

    console.log(
      "CREATE REPAIR REQUEST BODY:"
    );

    console.log(
      JSON.stringify(
        req.body,
        null,
        2
      )
    );

    console.log(
      "AUTH USER:",
      req.user
    );

    const repair =
      await repairService.createRepair(
        req.body
      );

    console.log(
      "REPAIR CREATED:",
      repair._id
    );

    return res.status(201).json({
      success: true,
      message:
        "Repair request created successfully.",
      data: repair,
    });
  } catch (error) {
    console.error(
      "=========================================="
    );

    console.error(
      "CREATE REPAIR ERROR:"
    );

    console.error(
      error
    );

    console.error(
      "ERROR MESSAGE:",
      error.message
    );

    console.error(
      "ERROR NAME:",
      error.name
    );

    if (error.code) {
      console.error(
        "ERROR CODE:",
        error.code
      );
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create repair request.",
      error:
        process.env.NODE_ENV === "production"
          ? undefined
          : {
              name: error.name,
              code: error.code,
              message: error.message,
            },
    });
  }
};


// ======================================================
// GET ALL
// ======================================================

export const getAllRepairs = async (
  req,
  res,
  next
) => {
  try {
    const repairs =
      await repairService.getAllRepairs();

    return res.status(200).json({
      success: true,
      count: repairs.length,
      data: repairs,
    });
  } catch (error) {
    next(error);
  }
};


// ======================================================
// GET BY ID
// ======================================================

export const getRepairById = async (
  req,
  res,
  next
) => {
  try {
    const repair =
      await repairService.getRepairById(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      data: repair,
    });
  } catch (error) {
    next(error);
  }
};


// ======================================================
// GET BY USER
// ======================================================

export const getRepairsByUser = async (
  req,
  res,
  next
) => {
  try {
    const repairs =
      await repairService.getRepairsByUser(
        req.params.userId
      );

    return res.status(200).json({
      success: true,
      count: repairs.length,
      data: repairs,
    });
  } catch (error) {
    next(error);
  }
};


// ======================================================
// GET BY PRODUCT
// ======================================================

export const getRepairsByProduct = async (
  req,
  res,
  next
) => {
  try {
    const repairs =
      await repairService.getRepairsByProduct(
        req.params.productId
      );

    return res.status(200).json({
      success: true,
      count: repairs.length,
      data: repairs,
    });
  } catch (error) {
    next(error);
  }
};


// ======================================================
// UPDATE
// ======================================================

export const updateRepair = async (
  req,
  res,
  next
) => {
  try {
    const repair =
      await repairService.updateRepair(
        req.params.id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message:
        "Repair updated successfully.",
      data: repair,
    });
  } catch (error) {
    next(error);
  }
};


// ======================================================
// UPDATE STATUS
// ======================================================

export const updateRepairStatus = async (
  req,
  res,
  next
) => {
  try {
    const { status } =
      req.body;

    const repair =
      await repairService.updateRepairStatus(
        req.params.id,
        status
      );

    return res.status(200).json({
      success: true,
      message:
        "Repair status updated successfully.",
      data: repair,
    });
  } catch (error) {
    next(error);
  }
};


// ======================================================
// MARK DELIVERED
// ======================================================

export const markDelivered = async (
  req,
  res,
  next
) => {
  try {
    const repair =
      await repairService.markDelivered(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message:
        "Repair marked as delivered successfully.",
      data: repair,
    });
  } catch (error) {
    next(error);
  }
};


// ======================================================
// DELETE
// ======================================================

export const deleteRepair = async (
  req,
  res,
  next
) => {
  try {
    await repairService.deleteRepair(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message:
        "Repair request deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};


// ======================================================
// MY ASSIGNED REPAIRS
// ======================================================

export const getMyAssignedRepairs = async (
  req,
  res,
  next
) => {
  try {
    const technicianId =
      req.user._id ||
      req.user.id;

    const repairs =
      await repairService.getRepairsByTechnician(
        technicianId
      );

    return res.status(200).json({
      success: true,
      count: repairs.length,
      data: repairs,
    });
  } catch (error) {
    next(error);
  }
};


// ======================================================
// TECHNICIANS
// ======================================================

export const getTechniciansList = async (
  req,
  res
) => {
  try {
    const technicians =
      await User.find({
        role: "TECHNICIAN",
      });

    return res.status(200).json({
      success: true,
      technicians,
    });
  } catch (error) {
    console.error(
      "GET TECHNICIANS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message,
    });
  }
};


// ======================================================
// TECHNICIAN PROFILE
// ======================================================

export const getTechnicianProfile = async (
  req,
  res
) => {
  try {
    const userId =
      req.user?._id ||
      req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "User not authenticated.",
      });
    }

    const user =
      await User.findById(
        userId
      ).select(
        "name firstName lastName email phone"
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "Technician not found in database.",
      });
    }

    const name =
      user.name ||
      `${user.firstName || ""} ${user.lastName || ""}`.trim();

    return res.status(200).json({
      success: true,
      data: {
        name,
        email:
          user.email || "",
        phone:
          user.phone || "",
      },
    });
  } catch (error) {
    console.error(
      "GET PROFILE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal server error.",
    });
  }
};


// ======================================================
// UPDATE PROFILE
// ======================================================

export const updateTechnicianProfile = async (
  req,
  res
) => {
  try {
    const {
      name,
      phone,
      email,
    } = req.body;

    const updatedUser =
      await User.findByIdAndUpdate(
        req.user.id ||
          req.user._id,
        {
          $set: {
            name,
            phone,
            email,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      ).select("-password");

    return res.status(200).json({
      success: true,
      message:
        "Profile updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error.message,
    });
  }
};


// ======================================================
// CHANGE PASSWORD
// ======================================================

export const changePassword = async (
  req,
  res
) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (
      !currentPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide both current and new passwords.",
      });
    }

    const user =
      await User.findById(
        req.user._id
      ).select(
        "+password"
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found.",
      });
    }

    const isMatch =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message:
          "Current password is incorrect.",
      });
    }

    const salt =
      await bcrypt.genSalt(10);

    user.password =
      await bcrypt.hash(
        newPassword,
        salt
      );

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password changed successfully.",
    });
  } catch (error) {
    console.error(
      "CHANGE PASSWORD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error changing password",
      error:
        error.message,
    });
  }
};


// ======================================================
// UPDATE REPAIR PAYMENT
// ======================================================

export const updateRepairPayment = async (
  req,
  res,
  next
) => {
  try {
    const {
      paidAmount,
      paymentMethod,
      paymentId,
      paymentStatus,
    } = req.body;

    const repair =
      await repairService.updateRepairPayment(
        req.params.id,
        {
          paidAmount,
          paymentMethod,
          paymentId,
          paymentStatus,
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "Repair payment updated successfully.",
      data: repair,
    });
  } catch (error) {
    next(error);
  }
};