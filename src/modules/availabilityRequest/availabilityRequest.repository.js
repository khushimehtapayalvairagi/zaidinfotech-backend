

import AvailabilityRequest
    from "./availabilityRequest.model.js";

// ==========================================
// Create Request
// ==========================================

export const createAvailabilityRequest =
    async (data) => {

        return await AvailabilityRequest.create(
            data
        );
    };


// ==========================================
// Get All Requests
// ==========================================

export const getAllAvailabilityRequests =
    async (filter = {}) => {

        return await AvailabilityRequest
            .find({
                ...filter,
                isDeleted: false
            })
            .populate({
                path: "product",
                select: "name sku images"
            })
            .sort({
                createdAt: -1
            });
    };


// ==========================================
// Get Request By ID
// ==========================================

export const getAvailabilityRequestById =
    async (id) => {

        return await AvailabilityRequest
            .findOne({
                _id: id,
                isDeleted: false
            })
            .populate({
                path: "product",
                select: "name sku images"
            });
    };


// ==========================================
// Update Request
// ==========================================

export const updateAvailabilityRequest =
    async (id, data) => {

        return await AvailabilityRequest
            .findOneAndUpdate(
                {
                    _id: id,
                    isDeleted: false
                },
                data,
                {
                    new: true,
                    runValidators: true
                }
            )
            .populate({
                path: "product",
                select: "name sku images"
            });
    };


// ==========================================
// Soft Delete Request
// ==========================================

export const deleteAvailabilityRequest =
    async (id) => {

        return await AvailabilityRequest
            .findOneAndUpdate(
                {
                    _id: id,
                    isDeleted: false
                },
                {
                    isDeleted: true
                },
                {
                    new: true
                }
            );
    };