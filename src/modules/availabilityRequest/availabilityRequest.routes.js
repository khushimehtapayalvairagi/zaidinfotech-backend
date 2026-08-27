import express from "express";

import {
    createAvailabilityRequest,
    getAllAvailabilityRequests,
    getAvailabilityRequestById,
    updateAvailabilityRequestStatus,
    deleteAvailabilityRequest
} from "./availabilityRequest.controller.js";

import {
    verifyToken
} from "../../common/middleware/auth.middleware.js";

import {
    allowRoles
} from "../../common/middleware/role.middleware.js";

import {
    validate
} from "../../common/middleware/validate.middleware.js";

import {
    createAvailabilityRequestValidation,
    updateAvailabilityRequestStatusValidation
} from "./availabilityRequest.validation.js";


const router = express.Router();


// ======================================================
// PUBLIC
// Customer login ke bina request submit kar sakta hai
// ======================================================

router.post(
    "/",
    validate(
        createAvailabilityRequestValidation
    ),
    createAvailabilityRequest
);


// ======================================================
// ADMIN / SALES
// ======================================================

const availabilityRequestRoles = [
    "ADMIN",
    "SUPER_ADMIN"
];


// ======================================================
// GET ALL
// ======================================================

router.get(
    "/",
    verifyToken,
    allowRoles(
        ...availabilityRequestRoles
    ),
    getAllAvailabilityRequests
);


// ======================================================
// GET BY ID
// ======================================================

router.get(
    "/:id",
    verifyToken,
    allowRoles(
        ...availabilityRequestRoles
    ),
    getAvailabilityRequestById
);


// ======================================================
// UPDATE STATUS
// ======================================================

router.patch(
    "/:id/status",
    verifyToken,
    allowRoles(
        ...availabilityRequestRoles
    ),
    validate(
        updateAvailabilityRequestStatusValidation
    ),
    updateAvailabilityRequestStatus
);


// ======================================================
// DELETE
// ======================================================

router.delete(
    "/:id",
    verifyToken,
    allowRoles(
        ...availabilityRequestRoles
    ),
    deleteAvailabilityRequest
);


export default router;