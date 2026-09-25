import mongoose from "mongoose";

import Order from "../orders/order.model.js";
import Inventory from "../inventory/inventory.model.js";
import Return from "./return.model.js";

import {
    createReturnDB,
    getReturnByIdDB,
    getReturnsDB,
    getReturnsByOrderDB,
    updateReturnDB
} from "./return.repository.js";


// ======================================================
// RETURN NUMBER
// ======================================================

const generateReturnNumber = () => {

    const timestamp = Date.now();

    const random = Math.floor(
        1000 + Math.random() * 9000
    );

    return `RET-${timestamp}-${random}`;
};


// ======================================================
// GET ALREADY RETURNED QUANTITY
// ======================================================

const getAlreadyReturnedQuantity = async (
    orderId,
    productId
) => {

    const returns = await Return.find({
        order: orderId,
        isDeleted: false,
        status: {
            $nin: [
                "REJECTED",
                "CANCELLED"
            ]
        }
    }).lean();

    let returnedQuantity = 0;

    for (const returnRequest of returns) {

        for (const item of returnRequest.items) {

            if (
                item.product.toString() ===
                productId.toString()
            ) {

                returnedQuantity += Number(
                    item.quantity || 0
                );

            }

        }

    }

    return returnedQuantity;
};


// ======================================================
// CREATE RETURN REQUEST
// ======================================================

export const createReturnService = async (
    data,
    userId
) => {

    const {
        orderId,
        items,
        pickupRequired = false,
        customerNote = ""
    } = data;


    // ==================================================
    // BASIC VALIDATION
    // ==================================================

    if (!orderId) {
        throw new Error(
            "Order ID is required"
        );
    }


    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {

        throw new Error(
            "At least one product is required for return"
        );

    }


    // ==================================================
    // FIND ORDER
    // ==================================================

    const order = await Order.findOne({
        _id: orderId
    });


    if (!order) {

        throw new Error(
            "Order not found"
        );

    }


    // ==================================================
    // CUSTOMER CHECK
    // ==================================================
    // Customer sirf apna order return kar sakta hai.
    //
    // Admin/Sales ke liye hum later separate route
    // bana sakte hain.

    if (
        order.user &&
        order.user.toString() !==
        userId.toString()
    ) {

        throw new Error(
            "You are not allowed to return this order"
        );

    }


    // ==================================================
    // ORDER STATUS CHECK
    // ==================================================

    const allowedStatuses = [
        "DELIVERED",
        "COMPLETED"
    ];

    if (
        !allowedStatuses.includes(
            order.orderStatus
        )
    ) {

        throw new Error(
            "Return can only be requested for delivered/completed orders"
        );

    }


    // ==================================================
    // PREVENT DUPLICATE ACTIVE RETURN
    // ==================================================

    const activeReturn = await Return.findOne({
        order: orderId,
        user: userId,
        isDeleted: false,
        status: {
            $nin: [
                "REJECTED",
                "CANCELLED",
                "COMPLETED"
            ]
        }
    });


    if (activeReturn) {

        throw new Error(
            "This order already has an active return request"
        );

    }


    // ==================================================
    // PREPARE ITEMS
    // ==================================================

    const returnItems = [];


    for (const requestedItem of items) {

        const orderItem = order.orderItems.find(
            (item) =>
                item.product.toString() ===
                requestedItem.productId.toString()
        );


        if (!orderItem) {

            throw new Error(
                `Product ${requestedItem.productId} was not found in this order`
            );

        }


        const requestedQuantity =
            Number(
                requestedItem.quantity
            );


        if (
            !requestedQuantity ||
            requestedQuantity < 1
        ) {

            throw new Error(
                `Invalid return quantity for ${orderItem.title}`
            );

        }


        // ==============================================
        // ALREADY RETURNED
        // ==============================================

        const alreadyReturned =
            await getAlreadyReturnedQuantity(
                orderId,
                requestedItem.productId
            );


        const remainingReturnable =
            orderItem.quantity -
            alreadyReturned;


        if (
            requestedQuantity >
            remainingReturnable
        ) {

            throw new Error(
                `${orderItem.title}: only ${remainingReturnable} quantity is available for return`
            );

        }


        // ==============================================
        // ADD RETURN ITEM
        // ==============================================

        returnItems.push({

            product: orderItem.product,

            title: orderItem.title,

            quantity: requestedQuantity,

            price: orderItem.price,

            reason:
                requestedItem.reason,

            reasonNote:
                requestedItem.reasonNote || "",

            condition: "PENDING",

            inspectionNote: "",

            restocked: false

        });

    }


    // ==================================================
    // PICKUP ADDRESS
    // ==================================================

    let pickupAddress = null;


    if (pickupRequired) {

        pickupAddress = {

            fullName:
                order.shippingAddress.fullName,

            phone:
                order.shippingAddress.phone,

            addressLine:
                order.shippingAddress.addressLine,

            city:
                order.shippingAddress.city,

            state:
                order.shippingAddress.state,

            pincode:
                order.shippingAddress.pincode,

            country:
                order.shippingAddress.country,

            landmark:
                order.shippingAddress.landmark

        };

    }


    // ==================================================
    // CREATE RETURN
    // ==================================================

    const returnRequest =
        await createReturnDB({

            returnNumber:
                generateReturnNumber(),

            order: order._id,

            user: order.user,

            items: returnItems,

            status: "REQUESTED",

            pickupRequired,

            pickupAddress,

            requestedBy: userId,

            customerNote

        });


    return returnRequest;

};


// ======================================================
// GET RETURN
// ======================================================

export const getReturnService = async (
    returnId
) => {

    const returnRequest =
        await getReturnByIdDB(
            returnId
        );


    if (!returnRequest) {

        throw new Error(
            "Return request not found"
        );

    }


    return returnRequest;

};


// ======================================================
// GET ALL RETURNS
// ======================================================

export const getReturnsService = async (
    filters = {}
) => {

    return await getReturnsDB(
        filters
    );

};


// ======================================================
// GET MY RETURNS
// ======================================================

export const getMyReturnsService = async (
    userId
) => {

    return await getReturnsDB({
        user: userId
    });

};


// ======================================================
// GET RETURNS BY ORDER
// ======================================================

export const getReturnsByOrderService = async (
    orderId,
    userId = null
) => {

    return await getReturnsByOrderDB(
        orderId,
        userId
    );

};


// ======================================================
// APPROVE RETURN
// ======================================================

export const approveReturnService = async (
    returnId,
    adminUserId
) => {

    const returnRequest =
        await Return.findOne({
            _id: returnId,
            isDeleted: false
        });


    if (!returnRequest) {

        throw new Error(
            "Return request not found"
        );

    }


    if (
        returnRequest.status !==
        "REQUESTED"
    ) {

        throw new Error(
            `Return cannot be approved from ${returnRequest.status} status`
        );

    }


    const updatedReturn =
        await updateReturnDB(
            returnId,
            {

                status:
                    returnRequest.pickupRequired
                        ? "APPROVED"
                        : "APPROVED",

                approvedBy:
                    adminUserId,

                approvedAt:
                    new Date()

            }
        );


    return updatedReturn;

};


// ======================================================
// REJECT RETURN
// ======================================================

export const rejectReturnService = async (
    returnId,
    adminUserId,
    rejectionReason
) => {

    const returnRequest =
        await Return.findOne({
            _id: returnId,
            isDeleted: false
        });


    if (!returnRequest) {

        throw new Error(
            "Return request not found"
        );

    }


    if (
        returnRequest.status !==
        "REQUESTED"
    ) {

        throw new Error(
            `Return cannot be rejected from ${returnRequest.status} status`
        );

    }


    return await updateReturnDB(
        returnId,
        {

            status:
                "REJECTED",

            approvedBy:
                adminUserId,

            approvedAt:
                new Date(),

            rejectionReason:
                rejectionReason || "Return rejected"

        }
    );

};


// ======================================================
// MARK PICKUP REQUESTED
// ======================================================

export const markPickupRequestedService =
    async (
        returnId,
        userId
    ) => {

        const returnRequest =
            await Return.findOne({
                _id: returnId,
                isDeleted: false
            });


        if (!returnRequest) {

            throw new Error(
                "Return request not found"
            );

        }


        if (
            returnRequest.status !==
            "APPROVED"
        ) {

            throw new Error(
                "Return must be approved before pickup"
            );

        }


        if (
            !returnRequest.pickupRequired
        ) {

            throw new Error(
                "Pickup is not required for this return"
            );

        }


        return await updateReturnDB(
            returnId,
            {
                status:
                    "PICKUP_REQUESTED",

                courierName:
                    "Blue Dart"
            }
        );

    };


// ======================================================
// MARK PICKED UP
// ======================================================

export const markPickedUpService =
    async (
        returnId,
        userId,
        trackingNumber = ""
    ) => {

        const returnRequest =
            await Return.findOne({
                _id: returnId,
                isDeleted: false
            });


        if (!returnRequest) {

            throw new Error(
                "Return request not found"
            );

        }


        if (
            returnRequest.status !==
            "PICKUP_REQUESTED"
        ) {

            throw new Error(
                "Return is not waiting for pickup"
            );

        }


        return await updateReturnDB(
            returnId,
            {

                status:
                    "PICKED_UP",

                trackingNumber,

                pickedUpAt:
                    new Date()

            }
        );

    };


// ======================================================
// RECEIVE RETURN
// ======================================================

export const receiveReturnService =
    async (
        returnId,
        userId
    ) => {

        const returnRequest =
            await Return.findOne({
                _id: returnId,
                isDeleted: false
            });


        if (!returnRequest) {

            throw new Error(
                "Return request not found"
            );

        }


        const allowedStatuses = [
            "APPROVED",
            "PICKED_UP"
        ];


        if (
            !allowedStatuses.includes(
                returnRequest.status
            )
        ) {

            throw new Error(
                `Return cannot be received from ${returnRequest.status} status`
            );

        }


        return await updateReturnDB(
            returnId,
            {

                status:
                    "RECEIVED",

                receivedBy:
                    userId,

                receivedAt:
                    new Date()

            }
        );

    };


// ======================================================
// INSPECT RETURN
// ======================================================

export const inspectReturnService =
    async (
        returnId,
        userId,
        inspectedItems
    ) => {

        const session =
            await mongoose.startSession();


        try {

            session.startTransaction();


            const returnRequest =
                await Return.findOne({
                    _id: returnId,
                    isDeleted: false
                }).session(session);


            if (!returnRequest) {

                throw new Error(
                    "Return request not found"
                );

            }


            if (
                returnRequest.status !==
                "RECEIVED"
            ) {

                throw new Error(
                    "Return must be received before inspection"
                );

            }


            if (
                !Array.isArray(
                    inspectedItems
                ) ||
                inspectedItems.length === 0
            ) {

                throw new Error(
                    "Inspection items are required"
                );

            }


            // ==================================================
            // INSPECT EACH ITEM
            // ==================================================

            for (
                const inspectedItem
                of inspectedItems
            ) {

                const returnItem =
                    returnRequest.items.find(
                        (item) =>
                            item.product.toString() ===
                            inspectedItem.productId.toString()
                    );


                if (!returnItem) {

                    throw new Error(
                        `Product ${inspectedItem.productId} not found in return`
                    );

                }


                const validConditions = [
                    "GOOD",
                    "DAMAGED",
                    "DEFECTIVE",
                    "MISSING_PARTS"
                ];


                if (
                    !validConditions.includes(
                        inspectedItem.condition
                    )
                ) {

                    throw new Error(
                        `Invalid condition for ${returnItem.title}`
                    );

                }


                returnItem.condition =
                    inspectedItem.condition;


                returnItem.inspectionNote =
                    inspectedItem.inspectionNote || "";

            }


            returnRequest.status =
                "INSPECTED";


            returnRequest.inspectedBy =
                userId;


            returnRequest.inspectedAt =
                new Date();


            await returnRequest.save({
                session
            });


            await session.commitTransaction();


            return returnRequest;

        } catch (error) {

            await session.abortTransaction();

            throw error;

        } finally {

            await session.endSession();

        }

    };


// ======================================================
// COMPLETE RETURN + UPDATE INVENTORY
// ======================================================

export const completeReturnService =
    async (
        returnId,
        userId
    ) => {

        const returnRequest =
            await Return.findOne({
                _id: returnId,
                isDeleted: false
            });


        if (!returnRequest) {

            throw new Error(
                "Return request not found"
            );

        }


        if (
            returnRequest.status !==
            "INSPECTED"
        ) {

            throw new Error(
                "Return must be inspected before completion"
            );

        }


        // ==================================================
        // PROCESS EACH PRODUCT
        // ==================================================

        for (
            const item
            of returnRequest.items
        ) {

            // ==============================================
            // GOOD PRODUCT
            // ==============================================

            if (
                item.condition ===
                "GOOD"
            ) {

                const inventory =
                    await Inventory.findOne({
                        product:
                            item.product,
                        isDeleted: false
                    });


                if (!inventory) {

                   throw new Error(
    `Inventory not found for ${item.title}`
);

                }


                inventory.currentStock =
    Number(inventory.currentStock || 0) +
    Number(item.quantity || 0);


                inventory.lastUpdatedBy =
                    userId;


                // ==========================================
                // UPDATE INVENTORY STATUS
                // ==========================================

                const availableStock =
                    Math.max(
                        Number(
                            inventory.currentStock || 0
                        ) -
                        Number(
                            inventory.reservedStock || 0
                        ),
                        0
                    );


                if (
                    availableStock <= 0
                ) {

                    inventory.status =
                        "OUT_OF_STOCK";

                } else if (
                    availableStock <=
                    inventory.minimumStock
                ) {

                    inventory.status =
                        "LOW_STOCK";

                } else {

                    inventory.status =
                        "IN_STOCK";

                }


                item.restocked = true;


                await inventory.save();

            }


            // ==============================================
            // DAMAGED / DEFECTIVE
            // ==============================================

            else {

                item.restocked = false;

            }

        }


        // ==================================================
        // COMPLETE RETURN
        // ==================================================

        returnRequest.status =
            "COMPLETED";


        returnRequest.completedBy =
            userId;


        returnRequest.completedAt =
            new Date();


        await returnRequest.save();


        return returnRequest;

    };

// ======================================================
// CANCEL RETURN
// ======================================================

export const cancelReturnService =
    async (
        returnId,
        userId
    ) => {

        const returnRequest =
            await Return.findOne({
                _id: returnId,
                isDeleted: false
            });


        if (!returnRequest) {

            throw new Error(
                "Return request not found"
            );

        }


        const cancellableStatuses = [
            "REQUESTED",
            "APPROVED"
        ];


        if (
            !cancellableStatuses.includes(
                returnRequest.status
            )
        ) {

            throw new Error(
                "Return cannot be cancelled now"
            );

        }


        return await updateReturnDB(
            returnId,
            {
                status:
                    "CANCELLED"
            }
        );

    };

    