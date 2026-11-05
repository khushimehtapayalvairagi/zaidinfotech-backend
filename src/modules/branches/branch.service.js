import mongoose from "mongoose";

import * as branchRepository from "./branch.repository.js";

const createError = (message, statusCode = 400) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

// CREATE BRANCH
export const createBranchService = async (data) => {
    const name = data.name.trim();
    const code = data.code.trim().toUpperCase();

    const existingCode = await branchRepository.findBranchByCode(code);

    if (existingCode) {
        throw createError("Branch code already exists.");
    }

    return await branchRepository.createBranch({
        ...data,
        name,
        code
    });
};

// GET ALL BRANCHES
export const getAllBranchesService = async (filters = {}) => {
    return await branchRepository.findAllBranches(filters);
};

// GET SINGLE BRANCH
export const getBranchByIdService = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw createError("Invalid branch ID.");
    }

    const branch = await branchRepository.findBranchById(id);

    if (!branch) {
        throw createError("Branch not found.", 404);
    }

    return branch;
};

// UPDATE BRANCH
export const updateBranchService = async (id, data) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw createError("Invalid branch ID.");
    }

    const existingBranch = await branchRepository.findBranchById(id);

    if (!existingBranch) {
        throw createError("Branch not found.", 404);
    }

    const updateData = { ...data };

    if (updateData.code) {
        updateData.code = updateData.code.trim().toUpperCase();

        const duplicate = await branchRepository.findBranchByCode(
            updateData.code,
            id
        );

        if (duplicate) {
            throw createError("Another branch already uses this code.");
        }
    }

    if (updateData.name) {
        updateData.name = updateData.name.trim();
    }

    return await branchRepository.updateBranch(id, updateData);
};

// DELETE BRANCH (SAFE SOFT DELETE)
export const deleteBranchService = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw createError("Invalid branch ID.");
    }

    const branch = await branchRepository.findBranchById(id);

    if (!branch) {
        throw createError("Branch not found.", 404);
    }

    return await branchRepository.deleteBranch(id);
};