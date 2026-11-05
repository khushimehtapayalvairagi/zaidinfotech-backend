import * as branchService from "./branch.service.js";

import {
    createBranchValidation,
    updateBranchValidation
} from "./branch.validation.js";

// CREATE
export const createBranchController = async (req, res) => {
    try {
        const { error, value } = createBranchValidation.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details.map(item => item.message).join(", ")
            });
        }

        const branch = await branchService.createBranchService(value);

        return res.status(201).json({
            success: true,
            message: "Branch created successfully.",
            data: branch
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to create branch."
        });
    }
};

// GET ALL
export const getAllBranchesController = async (req, res) => {
    try {
        const branches = await branchService.getAllBranchesService({
            status: req.query.status,
            includeDeleted: req.query.includeDeleted
        });

        return res.status(200).json({
            success: true,
            count: branches.length,
            data: branches
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch branches."
        });
    }
};

// GET SINGLE
export const getBranchByIdController = async (req, res) => {
    try {
        const branch = await branchService.getBranchByIdService(
            req.params.id
        );

        return res.status(200).json({
            success: true,
            data: branch
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch branch."
        });
    }
};

// UPDATE
export const updateBranchController = async (req, res) => {
    try {
        const { error, value } = updateBranchValidation.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details.map(item => item.message).join(", ")
            });
        }

        const branch = await branchService.updateBranchService(
            req.params.id,
            value
        );

        return res.status(200).json({
            success: true,
            message: "Branch updated successfully.",
            data: branch
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to update branch."
        });
    }
};

// DELETE (SOFT DELETE)
export const deleteBranchController = async (req, res) => {
    try {
        await branchService.deleteBranchService(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Branch deleted successfully."
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to delete branch."
        });
    }
};