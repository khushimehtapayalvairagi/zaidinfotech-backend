import * as availabilityService
    from "./availabilityRequest.service.js";

import {
    successResponse,
    errorResponse
} from "../../common/utils/apiResponse.js";


// ==========================================
// Create Availability Request
// PUBLIC API
// ==========================================

export const createAvailabilityRequest =
    async (req, res) => {

        try {

            const request =
                await availabilityService
                    .createAvailabilityRequestService(
                        req.body
                    );


            return successResponse(
                res,
                201,
                "Availability request submitted successfully",
                request
            );

        }
        catch (error) {

            return errorResponse(
                res,
                400,
                error.message
            );
        }
    };


// ==========================================
// Get All Availability Requests
// ADMIN
// ==========================================

export const getAllAvailabilityRequests =
    async (req, res) => {

        try {

            const {
                status
            } = req.query;


            const filter = {};

            if (status) {
                filter.status = status;
            }


            const requests =
                await availabilityService
                    .getAllAvailabilityRequestsService(
                        filter
                    );


            return successResponse(
                res,
                200,
                "Availability requests fetched successfully",
                requests
            );

        }
        catch (error) {

            return errorResponse(
                res,
                500,
                error.message
            );
        }
    };


// ==========================================
// Get Request By ID
// ADMIN
// ==========================================

export const getAvailabilityRequestById =
    async (req, res) => {

        try {

            const request =
                await availabilityService
                    .getAvailabilityRequestByIdService(
                        req.params.id
                    );


            return successResponse(
                res,
                200,
                "Availability request fetched successfully",
                request
            );

        }
        catch (error) {

            return errorResponse(
                res,
                404,
                error.message
            );
        }
    };


// ==========================================
// Update Status
// ADMIN
// ==========================================

export const updateAvailabilityRequestStatus =
    async (req, res) => {

        try {

            const request =
                await availabilityService
                    .updateAvailabilityRequestStatusService(
                        req.params.id,
                        req.body.status
                    );


            return successResponse(
                res,
                200,
                "Availability request status updated successfully",
                request
            );

        }
        catch (error) {

            return errorResponse(
                res,
                400,
                error.message
            );
        }
    };


// ==========================================
// Delete Request
// ADMIN
// ==========================================

export const deleteAvailabilityRequest =
    async (req, res) => {

        try {

            await availabilityService
                .deleteAvailabilityRequestService(
                    req.params.id
                );


            return successResponse(
                res,
                200,
                "Availability request deleted successfully"
            );

        }
        catch (error) {

            return errorResponse(
                res,
                400,
                error.message
            );
        }
    };