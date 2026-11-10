import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import * as repairService from "./repair.service.js";
import User from "../users/user.model.js";

// ======================================================
// COMMON ERROR HANDLER
// ======================================================

const handleControllerError = (res, error, fallbackMessage) => {
    console.error(`${fallbackMessage}:`, error);

    let statusCode = error.statusCode || error.status || 500;

    if (
        error.name === "ValidationError" ||
        error.name === "CastError" ||
        error.name === "BSONError"
    ) {
        statusCode = 400;
    }

    if (error.code === 11000) {
        statusCode = 409;
    }

    const message =
        error.message || fallbackMessage;

    return res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV !== "production" && {
            error: {
                name: error.name,
                code: error.code,
                message: error.message,
            },
        }),
    });
};

// ======================================================
// CREATE REPAIR REQUEST / JOB CARD
// ======================================================

export const createRepair = async (req, res, next) => {
    try {
        console.log("==========================================");
        console.log("CREATE REPAIR REQUEST BODY:");
        console.log(JSON.stringify(req.body, null, 2));
        console.log("AUTH USER:", req.user);

        // Branch is mandatory for every new Job Card.
        const { branchId } = req.body;

        if (!branchId) {
            return res.status(400).json({
                success: false,
                message: "Please select a branch before creating the Job Card.",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(branchId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid branch ID.",
            });
        }

        const repair = await repairService.createRepair({
            ...req.body,
            branchId,
        });

        console.log("REPAIR CREATED:", repair._id);

        return res.status(201).json({
            success: true,
            message: "Repair request created successfully.",
            data: repair,
        });
    } catch (error) {
        return handleControllerError(
            res,
            error,
            "Failed to create repair request."
        );
    }
};

// ======================================================
// GET ALL REPAIRS
// ======================================================

export const getAllRepairs = async (req, res, next) => {
    try {
        const repairs = await repairService.getAllRepairs();

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
// GET REPAIR BY ID
// ======================================================

export const getRepairById = async (req, res, next) => {
    try {
        const repair = await repairService.getRepairById(
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
// GET REPAIRS BY USER
// ======================================================

export const getRepairsByUser = async (req, res, next) => {
    try {
        const repairs = await repairService.getRepairsByUser(
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
// GET REPAIRS BY PRODUCT
// ======================================================

export const getRepairsByProduct = async (req, res, next) => {
    try {
        const repairs = await repairService.getRepairsByProduct(
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
// UPDATE REPAIR / JOB CARD
// ======================================================

export const updateRepair = async (req, res, next) => {
    try {
              const repair = await repairService.updateRepair(
            req.params.id,
            req.body,
            { id: req.user?._id || req.user?.id }
        );

        return res.status(200).json({
            success: true,
            message: "Repair updated successfully.",
            data: repair,
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// UPDATE REPAIR STATUS
// ======================================================

export const updateRepairStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Repair status is required.",
            });
        }

        const repair = await repairService.updateRepairStatus(
            req.params.id,
            status
        );

        return res.status(200).json({
            success: true,
            message: "Repair status updated successfully.",
            data: repair,
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// MARK REPAIR DELIVERED
// ======================================================

export const markDelivered = async (req, res, next) => {
    try {
        const repair = await repairService.markDelivered(
            req.params.id
        );

        return res.status(200).json({
            success: true,
            message: "Repair marked as delivered successfully.",
            data: repair,
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// SOFT DELETE REPAIR
// ======================================================

export const deleteRepair = async (req, res, next) => {
    try {
        await repairService.deleteRepair(
            req.params.id
        );

        return res.status(200).json({
            success: true,
            message: "Repair request deleted successfully.",
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// MY ASSIGNED REPAIRS
// ======================================================

export const getMyAssignedRepairs = async (req, res, next) => {
    try {
        const technicianId =
            req.user?._id || req.user?.id;

        if (!technicianId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated.",
            });
        }

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
// GET TECHNICIANS
// ======================================================

export const getTechniciansList = async (req, res) => {
    try {
        const technicians = await User.find({
            role: "TECHNICIAN",
            isDeleted: { $ne: true },
        }).select("-password");

        return res.status(200).json({
            success: true,
            count: technicians.length,
            technicians,
        });
    } catch (error) {
        return handleControllerError(
            res,
            error,
            "Failed to fetch technicians."
        );
    }
};

// ======================================================
// GET TECHNICIAN PROFILE
// ======================================================

export const getTechnicianProfile = async (req, res) => {
    try {
        const userId =
            req.user?._id || req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated.",
            });
        }

        const user = await User.findById(userId).select(
            "name firstName lastName email phone"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Technician not found in database.",
            });
        }

        const name =
            user.name ||
            `${user.firstName || ""} ${user.lastName || ""}`.trim();

        return res.status(200).json({
            success: true,
            data: {
                name,
                email: user.email || "",
                phone: user.phone || "",
            },
        });
    } catch (error) {
        return handleControllerError(
            res,
            error,
            "Failed to fetch technician profile."
        );
    }
};

// ======================================================
// UPDATE TECHNICIAN PROFILE
// ======================================================

export const updateTechnicianProfile = async (req, res) => {
    try {
        const userId =
            req.user?._id || req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated.",
            });
        }

        const { name, phone, email } = req.body;

        const updateData = {};

        if (name !== undefined) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;
        if (email !== undefined) updateData.email = email;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            {
                new: true,
                runValidators: true,
            }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            data: updatedUser,
        });
    } catch (error) {
        return handleControllerError(
            res,
            error,
            "Failed to update profile."
        );
    }
};

// ======================================================
// CHANGE PASSWORD
// ======================================================

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide both current and new passwords.",
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message:
                    "New password must contain at least 8 characters.",
            });
        }

        const userId =
            req.user?._id || req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated.",
            });
        }

        const user = await User.findById(userId).select(
            "+password"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        const isMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect.",
            });
        }

        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(
            newPassword,
            salt
        );

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully.",
        });
    } catch (error) {
        return handleControllerError(
            res,
            error,
            "Server error changing password."
        );
    }
};

// ======================================================
// UPDATE REPAIR PAYMENT
// ======================================================

export const updateRepairPayment = async (req, res, next) => {
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
            message: "Repair payment updated successfully.",
            data: repair,
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// TRANSFER JOB TO ANOTHER TECHNICIAN
// ======================================================

export const transferRepair = async (req, res) => {
    try {
        const repair = await repairService.transferRepair(
            req.params.id,
            req.body,
            {
                id: req.user?._id || req.user?.id,
                role: req.user?.role,
            }
        );

        return res.status(200).json({
            success: true,
            message: "Job transferred successfully.",
            data: repair,
        });
    } catch (error) {
        const message =
            error.message || "Failed to transfer job.";

        const statusCode = /not found/i.test(message)
            ? 404
            : /only transfer jobs/i.test(message)
                ? 403
                : 400;

        return res.status(statusCode).json({
            success: false,
            message,
        });
    }
};