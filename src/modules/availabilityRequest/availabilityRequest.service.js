import * as availabilityRepository
    from "./availabilityRequest.repository.js";

import Product
    from "../products/product.model.js";

import Inventory
    from "../inventory/inventory.model.js";
import {
    notifyAdminsService
} from "../notification/notification.service.js";


// ==========================================
// Create Availability Request
// ==========================================

export const createAvailabilityRequestService =
    async (data) => {

        // =====================================
        // CHECK PRODUCT
        // =====================================

        const product =
            await Product
                .findById(data.product)
                .select("_id name sku status");

        if (!product) {

            throw new Error(
                "Product not found"
            );
        }


        // =====================================
        // CHECK DISCONTINUED PRODUCT
        // =====================================

        if (
            product.status === "DISCONTINUED"
        ) {

            throw new Error(
                "This product has been discontinued"
            );
        }


        // =====================================
        // CHECK INVENTORY
        // =====================================

        const inventory =
            await Inventory.findOne({

                product: data.product,

                isDeleted: false

            });


        // =====================================
        // AVAILABLE STOCK
        // =====================================

        let availableStock = 0;

        if (inventory) {

            availableStock =
                Math.max(

                    Number(
                        inventory.currentStock || 0
                    )
                    -
                    Number(
                        inventory.reservedStock || 0
                    ),

                    0

                );

        }


        // =====================================
        // PRODUCT ALREADY AVAILABLE
        // =====================================

        if (availableStock > 0) {

            throw new Error(
                "Product is currently available. You can place an order."
            );

        }


        // =====================================
        // CREATE REQUEST
        // =====================================

        const request =
            await availabilityRepository
                .createAvailabilityRequest(data);


        // =====================================
        // NOTIFY ADMINS
        // =====================================

        try {

            await notifyAdminsService({

                type:
                    "AVAILABILITY_REQUEST",

                title:
                    "📦 New Availability Request",

                message:
                    `${data.name} requested availability for ${product.name}.`,

                relatedId:
                    request._id,

                relatedModel:
                    "AvailabilityRequest"

            });

        }
        catch (notificationError) {

            // Notification fail hone par
            // request fail nahi honi chahiye

            console.error(
                "AVAILABILITY REQUEST NOTIFICATION ERROR:",
                notificationError
            );

        }


        return request;
    };


// ==========================================
// Get All Requests
// ==========================================

export const getAllAvailabilityRequestsService =
    async (filter = {}) => {

        return await availabilityRepository
            .getAllAvailabilityRequests(filter);
    };


// ==========================================
// Get Request By ID
// ==========================================

export const getAvailabilityRequestByIdService =
    async (id) => {

        const request =
            await availabilityRepository
                .getAvailabilityRequestById(id);

        if (!request) {

            throw new Error(
                "Availability request not found"
            );
        }

        return request;
    };


// ==========================================
// Update Request Status
// ==========================================

export const updateAvailabilityRequestStatusService =
    async (id, status) => {

        const request =
            await availabilityRepository
                .getAvailabilityRequestById(id);

        if (!request) {

            throw new Error(
                "Availability request not found"
            );
        }


        return await availabilityRepository
            .updateAvailabilityRequest(
                id,
                {
                    status
                }
            );
    };


// ==========================================
// Delete Request
// ==========================================

export const deleteAvailabilityRequestService =
    async (id) => {

        const request =
            await availabilityRepository
                .getAvailabilityRequestById(id);

        if (!request) {

            throw new Error(
                "Availability request not found"
            );
        }


        await availabilityRepository
            .deleteAvailabilityRequest(id);

        return true;
    };


 