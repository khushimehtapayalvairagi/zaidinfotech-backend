import express from "express";

import {
    createOffer,
    getOffers,
    getActiveOffers,
    getOfferById,       // NEW import
    updateOffer,
    deleteOffer
} from "./offer.controller.js";

import {
    verifyToken
} from "../../common/middleware/auth.middleware.js";

import {
    allowRoles
} from "../../common/middleware/role.middleware.js";

import {
    validate
} from "../../common/middleware/validate.middleware.js";   // check yahi path hai tumhare project me

import {
    createOfferValidation,
    updateOfferValidation
} from "./offer.validation.js";


const router = express.Router();


// Admin Create Offer
router.post(
    "/",
    verifyToken,
    allowRoles("SUPER_ADMIN", "ADMIN"),
    validate(createOfferValidation),   // NEW
    createOffer
);


// Admin All Offers
router.get(
    "/",
    verifyToken,
    allowRoles("SUPER_ADMIN", "ADMIN"),
    getOffers
);


// Customer Homepage
router.get(
    "/active",
    getActiveOffers
);


// NEW: Get Single Offer (edit form ke liye)
router.get(
    "/:id",
    verifyToken,
    allowRoles("SUPER_ADMIN", "ADMIN"),
    getOfferById
);


// Update Offer
router.put(
    "/:id",
    verifyToken,
    allowRoles("SUPER_ADMIN", "ADMIN"),
    validate(updateOfferValidation),   // NEW
    updateOffer
);


// Delete Offer
router.delete(
    "/:id",
    verifyToken,
    allowRoles("SUPER_ADMIN", "ADMIN"),
    deleteOffer
);


export default router;