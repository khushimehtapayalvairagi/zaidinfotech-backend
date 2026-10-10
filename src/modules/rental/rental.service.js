import crypto from "crypto";
import mongoose from "mongoose";

import Payment from "../payments/payment.model.js";

import {
    notifyAdminsService
} from "../notification/notification.service.js";

import Rental from "./rental.model.js";
import RentalProduct from "./rentalProduct.model.js";
import RentalPayment from "./rentalPayment.model.js";

import {
    createPayment
} from "../payments/payment.service.js";

import {
    PAYMENT_STATUS
} from "../../common/constants/paymentStatus.js";

import {
    getRentalByIdDB,
    getCustomerRentalsDB,
    getAllRentalsDB,
    updateRentalDB,
    searchActiveRentalsForReturnDB
} from "./rental.repository.js";

import {
    ALLOWED_PAYMENT_METHODS,
    COMPANY_MIN_MONTHS,
    MAX_UNITS_COMPANY_ORDER,
    MAX_UNITS_INDIVIDUAL_ORDER,
    WRITE_OFF_CONDITIONS,
    normalizePaymentMethod,
    round2
} from "../../common/constants/rental.constants.js";

import {
    addDays,
    addMonths,
    adjustRemainingInstallments,
    buildScheduleDefinitions,
    calculateReturnDues,
    cancelInstallments,
    recordRentalInstallmentPaymentService,
    syncRentalPaymentFields
} from "./Rentalpayment.service.js";


// =====================================================
// HELPERS
// =====================================================

// Ek hi millisecond me 10 rentals bane to bhi number unique rahe
const generateRentalNumber = () => {

    const timestamp = Date.now().toString().slice(-8);
    const random = crypto.randomBytes(2).toString("hex").toUpperCase();

    return `RENT-${timestamp}-${random}`;
};

const generateOrderId = () => {

    const timestamp = Date.now().toString().slice(-8);
    const random = crypto.randomBytes(2).toString("hex").toUpperCase();

    return `ORD-${timestamp}-${random}`;
};

const releaseStock = async (reserved) => {

    for (const item of reserved) {

        try {

            await RentalProduct.updateOne(
                { _id: item.id },
                {
                    $inc: {
                        availableQuantity: item.quantity,
                        rentedQuantity: -item.quantity
                    }
                }
            );

        } catch (error) {

            console.error(
                "RENTAL STOCK RELEASE ERROR:",
                item.id,
                error.message
            );
        }
    }
};

const normalizeItems = (data) => {

    let rawItems = Array.isArray(data.items) ? data.items : [];

    // Purana format: ek hi rentalProductId + quantity
    if (rawItems.length === 0 && data.rentalProductId) {
        rawItems = [
            {
                rentalProductId: data.rentalProductId,
                quantity: data.quantity || 1
            }
        ];
    }

    if (rawItems.length === 0) {
        throw new Error("Please select at least one rental laptop");
    }

    const merged = new Map();

    for (const raw of rawItems) {

        const id = String(raw?.rentalProductId || "").trim();
        const quantity = Number(raw?.quantity ?? 1);

        if (!mongoose.isValidObjectId(id)) {
            throw new Error("Invalid rental product");
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            throw new Error(
                "Quantity must be a whole number of at least 1"
            );
        }

        merged.set(id, (merged.get(id) || 0) + quantity);
    }

    return [...merged.entries()].map(
        ([rentalProductId, quantity]) => ({
            rentalProductId,
            quantity
        })
    );
};

const buildCustomerDetails = (customerType, data) => {

    if (customerType === "INDIVIDUAL") {

        const d = data.individualDetails || {};

        const fullName = String(d.fullName || "").trim();
        const phone = String(d.phone || "").trim();

        if (!fullName) throw new Error("Customer full name is required");
        if (!phone) throw new Error("Customer phone number is required");

        return {
            individualDetails: {
                fullName,
                phone,
                email: String(d.email || "").trim().toLowerCase(),
                address: String(d.address || "").trim()
            },
            companyDetails: undefined
        };
    }

    const d = data.companyDetails || {};

    const companyName = String(d.companyName || "").trim();
    const contactPerson = String(d.contactPerson || "").trim();
    const phone = String(d.phone || "").trim();

    if (!companyName) throw new Error("Company name is required");
    if (!contactPerson) throw new Error("Contact person is required");
    if (!phone) throw new Error("Company phone number is required");

    return {
        individualDetails: undefined,
        companyDetails: {
            companyName,
            contactPerson,
            phone,
            email: String(d.email || "").trim().toLowerCase(),
            officeAddress: String(d.officeAddress || "").trim(),
            gstNumber: String(d.gstNumber || "").trim().toUpperCase()
        }
    };
};


// =====================================================
// CREATE WALK-IN RENTAL ORDER
//
// Rules:
//   INDIVIDUAL -> sirf 1 laptop
//   COMPANY    -> minimum 3 months, maximum 10 laptops
//
// Ek order me jitne laptops, utne Rental documents
// (same orderId). Har rental ka month-wise rent schedule banta hai.
// =====================================================

// export const createWalkInRentalService = async (
//     data,
//     createdBy
// ) => {

//     if (!data) {
//         throw new Error("Rental data is required");
//     }

//     // ------------- customer type -------------
//     const customerType = String(data.customerType || "").toUpperCase();

//     if (!["INDIVIDUAL", "COMPANY"].includes(customerType)) {
//         throw new Error("Invalid customer type");
//     }

//     // ------------- items / unit limit -------------
//     const items = normalizeItems(data);

//     const totalUnits = items.reduce((sum, i) => sum + i.quantity, 0);

//     if (customerType === "INDIVIDUAL" && totalUnits > MAX_UNITS_INDIVIDUAL_ORDER) {
//         throw new Error(
//             "Individual customer can rent only 1 laptop at a time"
//         );
//     }

//     if (customerType === "COMPANY" && totalUnits > MAX_UNITS_COMPANY_ORDER) {
//         throw new Error(
//             `Company can rent a maximum of ${MAX_UNITS_COMPANY_ORDER} laptops in one order`
//         );
//     }

//     const { individualDetails, companyDetails } =
//         buildCustomerDetails(customerType, data);

//     // ------------- load rental products -------------
//     const rentalProducts = await RentalProduct
//         .find({ _id: { $in: items.map((i) => i.rentalProductId) } })
//         .populate("productId");

//     const productMap = new Map(
//         rentalProducts.map((rp) => [String(rp._id), rp])
//     );

//     const lines = [];

//     for (const item of items) {

//         const rentalProduct = productMap.get(item.rentalProductId);

//         if (!rentalProduct) {
//             throw new Error("Rental product not found");
//         }

//         const name = rentalProduct.productId?.name || "Rental laptop";

//         if (rentalProduct.status !== "ACTIVE") {
//             throw new Error(`${name} is inactive`);
//         }

//         if (rentalProduct.isAvailableForRent !== true) {
//             throw new Error(`${name} is not available for rent`);
//         }

//         const available = Number(rentalProduct.availableQuantity || 0);

//         if (available < item.quantity) {
//             throw new Error(
//                 available <= 0
//                     ? `${name} is out of stock`
//                     : `Only ${available} unit(s) of ${name} available`
//             );
//         }

//         if (Number(rentalProduct.monthlyRent || 0) <= 0) {
//             throw new Error(`Monthly rent is not set for ${name}`);
//         }

//         lines.push({
//             rentalProduct,
//             quantity: item.quantity,
//             name
//         });
//     }

//     // ------------- duration -------------
//     const rentalDurationType = String(
//         data.rentalDurationType || ""
//     ).toUpperCase();

//     const rentalDuration = Number(data.rentalDuration || 0);

//     if (!["DAYS", "MONTHS"].includes(rentalDurationType)) {
//         throw new Error("Rental duration type must be DAYS or MONTHS");
//     }

//     if (!Number.isInteger(rentalDuration) || rentalDuration < 1) {
//         throw new Error("Rental duration must be a whole number of at least 1");
//     }

//     const productMinMonths = Math.max(
//         ...lines.map((l) =>
//             Number(l.rentalProduct.minimumRentalMonths || COMPANY_MIN_MONTHS)
//         ),
//         COMPANY_MIN_MONTHS
//     );

//     if (customerType === "COMPANY") {

//         if (rentalDurationType !== "MONTHS") {
//             throw new Error(
//                 `Company rental must be for a minimum of ${COMPANY_MIN_MONTHS} months`
//             );
//         }

//         if (rentalDuration < productMinMonths) {
//             throw new Error(
//                 `Minimum rental period is ${productMinMonths} months`
//             );
//         }

//     } else if (
//         rentalDurationType === "MONTHS" &&
//         rentalDuration < productMinMonths
//     ) {
//         throw new Error(
//             `Minimum rental period is ${productMinMonths} months`
//         );
//     }

//     // ------------- deposit (order level) -------------
//     const unitDeposits = [];

//     for (const line of lines) {
//         for (let u = 0; u < line.quantity; u++) {
//             unitDeposits.push(
//                 round2(line.rentalProduct.securityDeposit || 0)
//             );
//         }
//     }

//     const totalDeposit = round2(
//         unitDeposits.reduce((s, d) => s + d, 0)
//     );

//     let depositPaidTotal = round2(
//         Math.max(Number(data.depositAmountPaid || 0), 0)
//     );

//     if (depositPaidTotal > totalDeposit + 0.005) {
//         throw new Error(
//             `Deposit paid cannot be more than ₹${totalDeposit.toFixed(2)}`
//         );
//     }

//     let depositPaymentMethod = "NONE";
//     const depositPaymentReference = String(
//         data.depositPaymentReference || ""
//     ).trim();

//     if (depositPaidTotal > 0) {

//         depositPaymentMethod = normalizePaymentMethod(
//             data.depositPaymentMethod
//         );

//         if (!ALLOWED_PAYMENT_METHODS.includes(depositPaymentMethod)) {
//             throw new Error("Valid deposit payment method is required");
//         }
//     }

//     // ------------- rent paid now (first installment) -------------
//     const rentPaidNow = data.rentPaidNow === true;
//     const rentPaymentMethod = normalizePaymentMethod(
//         data.rentPaymentMethod
//     );
//     const rentPaymentReference = String(
//         data.rentPaymentReference || ""
//     ).trim();

//     if (rentPaidNow) {

//         if (!ALLOWED_PAYMENT_METHODS.includes(rentPaymentMethod)) {
//             throw new Error("Valid rent payment method is required");
//         }

//         if (rentPaymentMethod !== "CASH" && !rentPaymentReference) {
//             throw new Error(
//                 "Rent payment reference / transaction number is required"
//             );
//         }
//     }

//     // ------------- dates -------------
//     const startDate = new Date();

//     const expectedEndDate =
//         rentalDurationType === "MONTHS"
//             ? addMonths(startDate, rentalDuration)
//             : addDays(startDate, rentalDuration);

//     // =============================================
//     // RESERVE STOCK (atomic, har product ke liye)
//     // =============================================

//     const reserved = [];

//     try {

//         for (const line of lines) {

//             const updated = await RentalProduct.findOneAndUpdate(
//                 {
//                     _id: line.rentalProduct._id,
//                     status: "ACTIVE",
//                     isAvailableForRent: true,
//                     availableQuantity: { $gte: line.quantity }
//                 },
//                 {
//                     $inc: {
//                         availableQuantity: -line.quantity,
//                         rentedQuantity: line.quantity
//                     },
//                     $set: { updatedBy: createdBy || null }
//                 },
//                 { new: true }
//             );

//             if (!updated) {
//                 throw new Error(
//                     `Stock for ${line.name} just changed. Please refresh and try again.`
//                 );
//             }

//             reserved.push({
//                 id: line.rentalProduct._id,
//                 quantity: line.quantity,
//                 updated
//             });
//         }

//     } catch (error) {

//         await releaseStock(reserved);
//         throw error;
//     }

//     // =============================================
//     // CREATE RENTALS + RENT SCHEDULE
//     // =============================================

//     const orderId = generateOrderId();

//     let createdRentals = [];
//     let createdSchedules = [];

//     try {

//         const rentalDocs = [];
//         let unitIndex = 0;
//         let remainingDeposit = depositPaidTotal;

//         for (const line of lines) {

//             const rp = line.rentalProduct;

//             const monthlyRent = Number(rp.monthlyRent);
//             const gstPercentage = Number(rp.gst || 0);

//             const unitRent =
//                 rentalDurationType === "MONTHS"
//                     ? round2(monthlyRent * rentalDuration)
//                     : round2((monthlyRent / 30) * rentalDuration);

//             const unitGst = round2((unitRent * gstPercentage) / 100);

//             for (let u = 0; u < line.quantity; u++) {

//                 const unitDeposit = unitDeposits[unitIndex++];

//                 const allocated =
//                     unitDeposit > 0
//                         ? round2(Math.min(remainingDeposit, unitDeposit))
//                         : 0;

//                 remainingDeposit = round2(remainingDeposit - allocated);

//                 let depositStatus = "UNPAID";

//                 if (unitDeposit <= 0 || allocated >= unitDeposit) {
//                     depositStatus = "PAID";
//                 } else if (allocated > 0) {
//                     depositStatus = "PARTIAL";
//                 }

//                 rentalDocs.push({
//                     rentalNumber: generateRentalNumber(),
//                     orderId,

//                     customerId: null,

//                     productId: rp.productId?._id || rp.productId,
//                     rentalProductId: rp._id,

//                     rentalSource: "WALK_IN",
//                     customerType,
//                     individualDetails,
//                     companyDetails,

//                     monthlyRent,
//                     gstPercentage,
//                     securityDeposit: unitDeposit,

//                     rentSubtotal: unitRent,
//                     rentGstAmount: unitGst,
//                     rentTotalAmount: round2(unitRent + unitGst),

//                     rentalDurationType,
//                     rentalDuration,
//                     startDate,
//                     expectedEndDate,

//                     status: "ACTIVE",

//                     allocatedAt: new Date(),
//                     allocatedBy: createdBy || null,

//                     notes: String(
//                         data.notes || data.handoverNotes || ""
//                     ).trim(),

//                     depositPaymentStatus: depositStatus,
//                     depositPaid: depositStatus === "PAID",
//                     depositAmountPaid: allocated,
//                     depositPaymentMethod:
//                         allocated > 0 ? depositPaymentMethod : "NONE",
//                     depositPaymentReference:
//                         allocated > 0 ? depositPaymentReference : "",
//                     depositPaidAt: allocated > 0 ? new Date() : null
//                 });
//             }
//         }

//         createdRentals = await Rental.insertMany(rentalDocs);



// console.log("INSERTED WALK-IN RENTALS:", {
//     count: createdRentals.length,
//     rentals: createdRentals.map((rental) => ({
//         id: String(rental._id),
//         orderId: rental.orderId,
//         rentalNumber: rental.rentalNumber
//     }))
// });

//         // ---- month-wise rent schedule ----
//         const scheduleDocs = [];

//         for (const rental of createdRentals) {

//             const defs = buildScheduleDefinitions({
//                 startDate,
//                 rentalDurationType,
//                 rentalDuration,
//                 monthlyRent: rental.monthlyRent,
//                 gstPercentage: rental.gstPercentage
//             });

//             for (const def of defs) {
//                 scheduleDocs.push({
//                     ...def,
//                     rentalId: rental._id,
//                     rentalNumber: rental.rentalNumber,
//                     orderId
//                 });
//             }
//         }

//         createdSchedules = await RentalPayment.insertMany(scheduleDocs);

//     } catch (error) {

//         console.error("CREATE WALK-IN RENTAL ERROR (rolling back):", error);

//         try {
//             await RentalPayment.deleteMany({ orderId });
//             await Rental.deleteMany({ orderId });
//         } catch (cleanupError) {
//             console.error("WALK-IN ROLLBACK CLEANUP ERROR:", cleanupError);
//         }

//         await releaseStock(reserved);

//         throw new Error(
//             error?.message || "Failed to create walk-in rental"
//         );
//     }

//     // =============================================
//     // FIRST INSTALLMENT PAID NOW (optional)
//     // =============================================

//     const warnings = [];

//     if (rentPaidNow) {

//         const firstInstallments = createdSchedules.filter(
//             (s) => s.installmentNumber === 1
//         );

//         for (const installment of firstInstallments) {

//             try {

//                 await recordRentalInstallmentPaymentService(
//                     installment._id,
//                     {
//                         paymentMethod: rentPaymentMethod,
//                         reference: rentPaymentReference
//                     },
//                     createdBy
//                 );

//             } catch (error) {

//                 console.error("FIRST RENT PAYMENT ERROR:", error);

//                 warnings.push(
//                     `Rent payment for ${installment.rentalNumber} could not be saved: ${error.message}`
//                 );
//             }
//         }
//     }

//     for (const rental of createdRentals) {
//         await syncRentalPaymentFields(rental._id);
//     }

//     // =============================================
//     // LOW STOCK NOTIFICATION
//     // =============================================

//     for (const item of reserved) {

//         if (item.updated.availableQuantity <= 5) {

//             try {

//                 const line = lines.find(
//                     (l) => String(l.rentalProduct._id) === String(item.id)
//                 );

//                 await notifyAdminsService({
//                     type: "RENTAL_STOCK_LOW",
//                     title: "Rental Stock Low",
//                     message:
//                         `${line?.name || "Rental product"} rental stock is low. ` +
//                         `Only ${item.updated.availableQuantity} unit(s) available.`,
//                     relatedId: item.updated._id,
//                     relatedModel: "RentalProduct"
//                 });

//             } catch (notificationError) {

//                 console.error(
//                     "Rental stock notification failed:",
//                     notificationError.message
//                 );
//             }
//         }
//     }

//     // =============================================
//     // FINAL RESPONSE
//     // =============================================

// //     const rentals = await Rental
// //         .find({ orderId })
// //         .populate({
// //             path: "productId",
// //             populate: [{ path: "brand" }, { path: "category" }]
// //         })
// //         .populate("rentalProductId")
// //         .sort({ createdAt: 1 });

// //     return {
// //         orderId,
// //         rentals,
// //         warnings
// //     };
// // };


// const rentals = await Rental
// .find({ orderId })
// .populate({
// path: "productId",
// populate: [{ path: "brand" }, { path: "category" }]
// })
// .populate("rentalProductId")
// .sort({ createdAt: 1 });

// console.log("WALK-IN RENTAL FINAL QUERY:", {
// orderId,
// rentalsCount: rentals.length,
// rentalIds: rentals.map((rental) => rental._id.toString())
// });

// return {
// orderId,
// rentals,
// warnings
// };

// };



export const createWalkInRentalService = async (
    data,
    createdBy
) => {
    if (!data) {
        throw new Error("Rental data is required");
    }

    const customerType = String(data.customerType || "").toUpperCase();

    if (!["INDIVIDUAL", "COMPANY"].includes(customerType)) {
        throw new Error("Invalid customer type");
    }

    const items = normalizeItems(data);
    const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);

    if (
        customerType === "INDIVIDUAL" &&
        totalUnits > MAX_UNITS_INDIVIDUAL_ORDER
    ) {
        throw new Error(
            "Individual customer can rent only 1 laptop at a time"
        );
    }

    if (
        customerType === "COMPANY" &&
        totalUnits > MAX_UNITS_COMPANY_ORDER
    ) {
        throw new Error(
            `Company can rent a maximum of ${MAX_UNITS_COMPANY_ORDER} laptops in one order`
        );
    }

    const { individualDetails, companyDetails } =
        buildCustomerDetails(customerType, data);

    const rentalProducts = await RentalProduct
        .find({
            _id: {
                $in: items.map((item) => item.rentalProductId)
            }
        })
        .populate("productId");

    const productMap = new Map(
        rentalProducts.map((product) => [String(product._id), product])
    );

    const lines = [];

    for (const item of items) {
        const rentalProduct = productMap.get(item.rentalProductId);

        if (!rentalProduct) {
            throw new Error("Rental product not found");
        }

        const name = rentalProduct.productId?.name || "Rental laptop";

        if (rentalProduct.status !== "ACTIVE") {
            throw new Error(`${name} is inactive`);
        }

        if (rentalProduct.isAvailableForRent !== true) {
            throw new Error(`${name} is not available for rent`);
        }

        const available = Number(rentalProduct.availableQuantity || 0);

        if (available < item.quantity) {
            throw new Error(
                available <= 0
                    ? `${name} is out of stock`
                    : `Only ${available} unit(s) of ${name} available`
            );
        }

        if (Number(rentalProduct.monthlyRent || 0) <= 0) {
            throw new Error(`Monthly rent is not set for ${name}`);
        }

        lines.push({
            rentalProduct,
            quantity: item.quantity,
            name
        });
    }

    const rentalDurationType = String(
        data.rentalDurationType || ""
    ).toUpperCase();

    const rentalDuration = Number(data.rentalDuration || 0);

    if (!["DAYS", "MONTHS"].includes(rentalDurationType)) {
        throw new Error("Rental duration type must be DAYS or MONTHS");
    }

    if (!Number.isInteger(rentalDuration) || rentalDuration < 1) {
        throw new Error(
            "Rental duration must be a whole number of at least 1"
        );
    }

    const productMinMonths = Math.max(
        ...lines.map((line) =>
            Number(
                line.rentalProduct.minimumRentalMonths ||
                COMPANY_MIN_MONTHS
            )
        ),
        COMPANY_MIN_MONTHS
    );

    if (customerType === "COMPANY") {
        if (rentalDurationType !== "MONTHS") {
            throw new Error(
                `Company rental must be for a minimum of ${COMPANY_MIN_MONTHS} months`
            );
        }

        if (rentalDuration < productMinMonths) {
            throw new Error(
                `Minimum rental period is ${productMinMonths} months`
            );
        }
    } else if (
        rentalDurationType === "MONTHS" &&
        rentalDuration < productMinMonths
    ) {
        throw new Error(
            `Minimum rental period is ${productMinMonths} months`
        );
    }

    // ---------------- DEPOSIT ----------------

    const unitDeposits = [];

    for (const line of lines) {
        for (let unit = 0; unit < line.quantity; unit++) {
            unitDeposits.push(
                round2(line.rentalProduct.securityDeposit || 0)
            );
        }
    }

    const totalDeposit = round2(
        unitDeposits.reduce((sum, amount) => sum + amount, 0)
    );

    const depositPaidTotal = round2(
        Math.max(Number(data.depositAmountPaid || 0), 0)
    );

    if (depositPaidTotal > totalDeposit + 0.005) {
        throw new Error(
            `Deposit paid cannot be more than ₹${totalDeposit.toFixed(2)}`
        );
    }

    let depositPaymentMethod = "NONE";

    const depositPaymentReference = String(
        data.depositPaymentReference || ""
    ).trim();

    if (depositPaidTotal > 0) {
        depositPaymentMethod = normalizePaymentMethod(
            data.depositPaymentMethod
        );

        if (!ALLOWED_PAYMENT_METHODS.includes(depositPaymentMethod)) {
            throw new Error("Valid deposit payment method is required");
        }
    }

    // ---------------- RENT PAYMENT ----------------

    const rentPaidNow = data.rentPaidNow === true;

    const rentPaymentMethod = normalizePaymentMethod(
        data.rentPaymentMethod
    );

    const rentPaymentReference = String(
        data.rentPaymentReference || ""
    ).trim();

    if (rentPaidNow) {
        if (!ALLOWED_PAYMENT_METHODS.includes(rentPaymentMethod)) {
            throw new Error("Valid rent payment method is required");
        }

        if (rentPaymentMethod !== "CASH" && !rentPaymentReference) {
            throw new Error(
                "Rent payment reference / transaction number is required"
            );
        }
    }

    // ---------------- DATES ----------------

    const startDate = new Date();

    const expectedEndDate =
        rentalDurationType === "MONTHS"
            ? addMonths(startDate, rentalDuration)
            : addDays(startDate, rentalDuration);

    // ---------------- RESERVE STOCK ----------------

    const reserved = [];

    try {
        for (const line of lines) {
            const updated = await RentalProduct.findOneAndUpdate(
                {
                    _id: line.rentalProduct._id,
                    status: "ACTIVE",
                    isAvailableForRent: true,
                    availableQuantity: { $gte: line.quantity }
                },
                {
                    $inc: {
                        availableQuantity: -line.quantity,
                        rentedQuantity: line.quantity
                    },
                    $set: {
                        updatedBy: createdBy || null
                    }
                },
                {
                    new: true,
                    runValidators: true
                }
            );

            if (!updated) {
                throw new Error(
                    `Stock for ${line.name} just changed. Please refresh and try again.`
                );
            }

            reserved.push({
                id: line.rentalProduct._id,
                quantity: line.quantity,
                updated
            });
        }
    } catch (error) {
        await releaseStock(reserved);
        throw error;
    }

    // ---------------- CREATE RENTALS + SCHEDULES ----------------

    const orderId = generateOrderId();

    let createdRentals = [];
    let createdSchedules = [];

    try {
        const rentalDocs = [];

        let unitIndex = 0;
        let remainingDeposit = depositPaidTotal;

        for (const line of lines) {
            const rp = line.rentalProduct;

            const monthlyRent = Number(rp.monthlyRent);
            const gstPercentage = Number(rp.gst || 0);

            const unitRent =
                rentalDurationType === "MONTHS"
                    ? round2(monthlyRent * rentalDuration)
                    : round2((monthlyRent / 30) * rentalDuration);

            const unitGst = round2(
                (unitRent * gstPercentage) / 100
            );

            for (let unit = 0; unit < line.quantity; unit++) {
                const unitDeposit = unitDeposits[unitIndex++];

                const allocated =
                    unitDeposit > 0
                        ? round2(
                            Math.min(remainingDeposit, unitDeposit)
                        )
                        : 0;

                remainingDeposit = round2(
                    remainingDeposit - allocated
                );

                let depositStatus = "UNPAID";

                if (unitDeposit <= 0 || allocated >= unitDeposit) {
                    depositStatus = "PAID";
                } else if (allocated > 0) {
                    depositStatus = "PARTIAL";
                }

                rentalDocs.push({
                    rentalNumber: generateRentalNumber(),

                    // IMPORTANT: Rental schema must declare orderId.
                    orderId,

                    customerId: null,
                    productId: rp.productId?._id || rp.productId,
                    rentalProductId: rp._id,

                    rentalSource: "WALK_IN",
                    customerType,
                    individualDetails,
                    companyDetails,

                    monthlyRent,
                    gstPercentage,
                    securityDeposit: unitDeposit,

                    rentSubtotal: unitRent,
                    rentGstAmount: unitGst,
                    rentTotalAmount: round2(unitRent + unitGst),

                    rentalDurationType,
                    rentalDuration,
                    startDate,
                    expectedEndDate,

                    status: "ACTIVE",

                    allocatedAt: new Date(),
                    allocatedBy: createdBy || null,

                    notes: String(
                        data.notes || data.handoverNotes || ""
                    ).trim(),

                    depositPaymentStatus: depositStatus,
                    depositPaid: depositStatus === "PAID",
                    depositAmountPaid: allocated,

                    depositPaymentMethod:
                        allocated > 0
                            ? depositPaymentMethod
                            : "NONE",

                    depositPaymentReference:
                        allocated > 0
                            ? depositPaymentReference
                            : "",

                    depositPaidAt:
                        allocated > 0
                            ? new Date()
                            : null
                });
            }
        }

        if (!rentalDocs.length) {
            throw new Error("No rental documents were prepared");
        }

        createdRentals = await Rental.insertMany(rentalDocs);

        console.log("INSERTED WALK-IN RENTALS:", {
            expectedOrderId: orderId,
            count: createdRentals.length,
            rentals: createdRentals.map((rental) => ({
                id: String(rental._id),
                orderId: rental.orderId,
                rentalNumber: rental.rentalNumber
            }))
        });

        if (createdRentals.length !== rentalDocs.length) {
            throw new Error(
                "Not all rental records were inserted successfully"
            );
        }

        // Verify that MongoDB can find the inserted rental records.
        const insertedIds = createdRentals.map(
            (rental) => rental._id
        );

        const persistedRentals = await Rental.find({
            _id: { $in: insertedIds }
        }).lean();

        console.log("PERSISTED WALK-IN RENTALS:", {
            expected: insertedIds.length,
            found: persistedRentals.length,
            orderIds: persistedRentals.map(
                (rental) => rental.orderId
            )
        });

        if (persistedRentals.length !== insertedIds.length) {
            throw new Error(
                "Rental records were inserted but could not be verified in the database"
            );
        }

        const missingOrderId = persistedRentals.some(
            (rental) => String(rental.orderId || "") !== orderId
        );

        if (missingOrderId) {
            throw new Error(
                "Saved rentals are missing the correct orderId. Check rental.model.js and restart the backend."
            );
        }

        // ---------------- MONTH-WISE RENT SCHEDULE ----------------

        const scheduleDocs = [];

        for (const rental of createdRentals) {
            const definitions = buildScheduleDefinitions({
                startDate,
                rentalDurationType,
                rentalDuration,
                monthlyRent: rental.monthlyRent,
                gstPercentage: rental.gstPercentage
            });

            for (const definition of definitions) {
                scheduleDocs.push({
                    ...definition,
                    rentalId: rental._id,
                    rentalNumber: rental.rentalNumber,
                    orderId
                });
            }
        }

        if (scheduleDocs.length) {
            createdSchedules = await RentalPayment.insertMany(
                scheduleDocs
            );
        }
    } catch (error) {
        console.error(
            "CREATE WALK-IN RENTAL ERROR (rolling back):",
            error
        );

        // Roll back only when the core rental/schedule creation fails.
        try {
            await RentalPayment.deleteMany({ orderId });
            await Rental.deleteMany({ orderId });
        } catch (cleanupError) {
            console.error(
                "WALK-IN ROLLBACK CLEANUP ERROR:",
                cleanupError
            );
        }

        await releaseStock(reserved);

        throw new Error(
            error?.message || "Failed to create walk-in rental"
        );
    }

    // ---------------- FIRST INSTALLMENT PAID NOW ----------------

    const warnings = [];

    if (rentPaidNow) {
        const firstInstallments = createdSchedules.filter(
            (schedule) => schedule.installmentNumber === 1
        );

        for (const installment of firstInstallments) {
            try {
                await recordRentalInstallmentPaymentService(
                    installment._id,
                    {
                        paymentMethod: rentPaymentMethod,
                        reference: rentPaymentReference
                    },
                    createdBy
                );
            } catch (error) {
                console.error(
                    "FIRST RENT PAYMENT ERROR:",
                    error
                );

                warnings.push(
                    `Rent payment for ${installment.rentalNumber} could not be saved: ${error.message}`
                );
            }
        }
    }

    // Keep payment-field synchronization independent per rental.
    for (const rental of createdRentals) {
        try {
            await syncRentalPaymentFields(rental._id);
        } catch (error) {
            console.error(
                "RENTAL PAYMENT FIELD SYNC ERROR:",
                String(rental._id),
                error
            );

            warnings.push(
                `Payment summary sync failed for ${rental.rentalNumber}`
            );
        }
    }

    // ---------------- LOW STOCK NOTIFICATION ----------------

    for (const item of reserved) {
        if (item.updated.availableQuantity <= 5) {
            try {
                const line = lines.find(
                    (entry) =>
                        String(entry.rentalProduct._id) ===
                        String(item.id)
                );

                await notifyAdminsService({
                    type: "RENTAL_STOCK_LOW",
                    title: "Rental Stock Low",
                    message:
                        `${line?.name || "Rental product"} rental stock is low. ` +
                        `Only ${item.updated.availableQuantity} unit(s) available.`,
                    relatedId: item.updated._id,
                    relatedModel: "RentalProduct"
                });
            } catch (notificationError) {
                console.error(
                    "Rental stock notification failed:",
                    notificationError.message
                );
            }
        }
    }

    // ---------------- FINAL RESPONSE ----------------

    let rentals = await Rental
        .find({ orderId })
        .populate({
            path: "productId",
            populate: [
                { path: "brand" },
                { path: "category" }
            ]
        })
        .populate("rentalProductId")
        .sort({ createdAt: 1 });

    // Fallback by the exact IDs already inserted. This helps diagnose
    // a query mismatch without returning an empty array silently.
    if (!rentals.length && createdRentals.length) {
        console.error(
            "ORDER QUERY RETURNED ZERO RENTALS; TRYING INSERTED IDS",
            {
                orderId,
                insertedIds: createdRentals.map(
                    (rental) => String(rental._id)
                )
            }
        );

        rentals = await Rental
            .find({
                _id: {
                    $in: createdRentals.map(
                        (rental) => rental._id
                    )
                }
            })
            .populate({
                path: "productId",
                populate: [
                    { path: "brand" },
                    { path: "category" }
                ]
            })
            .populate("rentalProductId")
            .sort({ createdAt: 1 });
    }

    console.log("WALK-IN RENTAL FINAL QUERY:", {
        orderId,
        insertedCount: createdRentals.length,
        rentalsCount: rentals.length,
        rentalIds: rentals.map(
            (rental) => String(rental._id)
        ),
        warnings
    });

    if (!rentals.length) {
        throw new Error(
            "Rental creation could not be verified. Check backend logs for INSERTED WALK-IN RENTALS and PERSISTED WALK-IN RENTALS."
        );
    }

    return {
        orderId,
        rentals,
        warnings
    };
};


// =====================================================
// MARK SECURITY DEPOSIT RECEIVED (WALK-IN)
// =====================================================

export const markRentalDepositReceivedService = async (
    rentalId,
    data,
    userId
) => {

    const rental = await getRentalByIdDB(rentalId);

    if (!rental) {
        throw new Error("Rental not found");
    }

    if (
        String(rental.rentalSource || "").toUpperCase() !== "WALK_IN"
    ) {
        throw new Error(
            "Security deposit receipt is available only for walk-in rentals"
        );
    }

    const receivedBy = userId || null;

    if (!receivedBy) {
        throw new Error(
            "Authenticated user is required to receive security deposit"
        );
    }

    const paymentMethod = normalizePaymentMethod(
        data?.paymentMethod || data?.depositPaymentMethod
    );

    if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
        throw new Error("Valid deposit payment method is required");
    }

    const securityDeposit = Number(rental.securityDeposit || 0);

    const depositAmount = Number(
        data?.amount ?? data?.depositAmount ?? securityDeposit
    );

    if (!Number.isFinite(depositAmount)) {
        throw new Error("Invalid security deposit amount");
    }

    if (depositAmount < 0) {
        throw new Error("Security deposit amount cannot be negative");
    }

    if (
        Number(depositAmount.toFixed(2)) !==
        Number(securityDeposit.toFixed(2))
    ) {
        throw new Error(
            `Deposit amount must be ₹${securityDeposit.toFixed(2)}`
        );
    }

    if (rental.securityDepositPaymentId) {
        throw new Error("Security deposit has already been received");
    }

    // ---- payment pehle ban chuka ho par link na hua ho ----
    const existingDeposit = await Payment.findOne({
        paymentFor: "RENTAL",
        referenceId: rental._id,
        paymentType: "SECURITY_DEPOSIT",
        paymentStatus: PAYMENT_STATUS.SUCCESS,
        isDeleted: false
    });

    if (existingDeposit) {

        const updatedExisting = await updateRentalDB(rentalId, {
            securityDepositPaymentId: existingDeposit._id,
            depositReceived: true,
            depositReceivedAt: existingDeposit.paidAt || new Date(),
            depositReceivedBy: receivedBy,
            depositPaymentMethod: existingDeposit.paymentMethod
        });

        return await getRentalByIdDB(updatedExisting._id);
    }

    // ---- zero deposit ----
    if (depositAmount === 0) {

        const updated = await updateRentalDB(rentalId, {
            depositReceived: true,
            depositReceivedAt: new Date(),
            depositReceivedBy: receivedBy,
            depositPaymentMethod: paymentMethod,
            securityDepositPaymentId: null
        });

        if (!updated) {
            throw new Error("Failed to mark deposit as received");
        }

        return await getRentalByIdDB(rentalId);
    }

    // ---- create payment ----
    let payment = null;

    try {

        payment = await createPayment({
            user: receivedBy,
            paymentFor: "RENTAL",
            saleSource: "WALK_IN",
            paymentType: "SECURITY_DEPOSIT",
            referenceId: rental._id,
            amount: depositAmount,
            currency: "INR",
            paymentMethod,
            paymentStatus: PAYMENT_STATUS.SUCCESS,
            gateway: "OFFLINE",
            transactionId: String(
                data?.transactionId || data?.referenceNumber || ""
            ).trim(),
            gatewayPaymentId: "",
            gatewayResponse: {},
            paymentDate: new Date(),
            paidAt: new Date()
        });

    } catch (paymentError) {

        console.error(
            "SECURITY DEPOSIT PAYMENT CREATE ERROR:",
            paymentError
        );

        throw new Error(
            paymentError?.message ||
            "Failed to create security deposit payment"
        );
    }

    // ---- update rental ----
    try {

        const updated = await updateRentalDB(rentalId, {
            securityDepositPaymentId: payment._id,
            depositReceived: true,
            depositReceivedAt: new Date(),
            depositReceivedBy: receivedBy,
            depositPaymentMethod: paymentMethod,
            depositTransactionId: String(
                data?.transactionId || data?.referenceNumber || ""
            ).trim(),
            depositPaymentStatus: "PAID",
            depositPaid: true,
            depositAmountPaid: depositAmount,
            depositPaidAt: new Date()
        });

        if (!updated) {
            throw new Error(
                "Failed to update rental with deposit payment"
            );
        }

        return await getRentalByIdDB(rentalId);

    } catch (rentalUpdateError) {

        console.error("RENTAL DEPOSIT UPDATE ERROR:", rentalUpdateError);

        if (payment?._id) {
            try {
                await Payment.findByIdAndDelete(payment._id);
            } catch (deleteError) {
                console.error(
                    "DEPOSIT PAYMENT ROLLBACK ERROR:",
                    deleteError
                );
            }
        }

        throw new Error(
            rentalUpdateError?.message ||
            "Failed to record security deposit"
        );
    }
};


// =====================================================
// SIMPLE GETTERS
// =====================================================

export const getMyRentalsService = async (customerId) => {
    return await getCustomerRentalsDB(customerId);
};

export const getRentalService = async (rentalId) => {

    const rental = await getRentalByIdDB(rentalId);

    if (!rental) {
        throw new Error("Rental not found");
    }

    return rental;
};

export const getAllRentalsService = async () => {
    return await getAllRentalsDB();
};

export const searchRentalsForReturnService = async (search) => {

    const value = String(search || "").trim();

    if (!value) {
        throw new Error(
            "Rental number or customer phone is required"
        );
    }

    return await searchActiveRentalsForReturnDB(value);
};


// =====================================================
// RECEIVE RENTAL RETURN
//
// ACTIVE -> SETTLEMENT_PENDING
//
// Pending rent automatically schedule se aata hai:
//   - jo months due ho chuke aur unpaid hain
//   - COMPANY: pehle 3 months compulsory
// Receptionist agar zyada amount likhe to wahi (bada wala) use hota hai.
// Baaki future months cancel ho jaate hain.
//
// Deposit refund sirf us deposit par hota hai jo asal me mila hai.
//
// Stock yahan increase NAHI hota - settlement ke baad hota hai.
// =====================================================

export const markRentalReturnedService = async (
    rentalId,
    data = {}
) => {

    const rental = await getRentalByIdDB(rentalId);

    if (!rental) {
        throw new Error("Rental not found");
    }

    if (rental.status !== "ACTIVE") {
        throw new Error("Only active rental can be returned");
    }

    const returnCondition = String(
        data.returnCondition || ""
    ).trim().toUpperCase();

    if (
        !["GOOD", "DAMAGED", "HEAVILY_DAMAGED", "MISSING"].includes(
            returnCondition
        )
    ) {
        throw new Error("Invalid return condition");
    }

    const enteredPendingRent = Number(data.pendingRent || 0);
    const damageCharges = Number(data.damageCharges || 0);
    const otherDeductions = Number(data.otherDeductions || 0);

    for (const [label, value] of [
        ["Pending rent", enteredPendingRent],
        ["Damage charges", damageCharges],
        ["Other deductions", otherDeductions]
    ]) {
        if (!Number.isFinite(value) || value < 0) {
            throw new Error(`${label} cannot be negative`);
        }
    }

    // ---------- schedule se pending rent ----------
    const returnDate = new Date();

    const dues = await calculateReturnDues(rental, returnDate);

    const pendingRent = round2(
        Math.max(enteredPendingRent, dues.pendingRent)
    );

    const gstPercentage = Number(rental.gstPercentage || 0);

    const pendingRentGST = round2(
        (pendingRent * gstPercentage) / 100
    );

    const totalPendingRent = round2(pendingRent + pendingRentGST);

    const totalDeductions = round2(
        totalPendingRent + damageCharges + otherDeductions
    );

    // ---------- deposit jo asal me mila ----------
    const heldDeposit = round2(
        Math.min(
            Number(rental.depositAmountPaid || 0),
            Number(rental.securityDeposit || 0)
        )
    );

    const depositBalance = round2(heldDeposit - totalDeductions);

    const depositRefundAmount = Math.max(depositBalance, 0);
    const extraPayableAmount = Math.max(-depositBalance, 0);

    let depositRefundStatus = "NOT_APPLICABLE";
    let settlementStatus = "PENDING";

    if (depositRefundAmount > 0) {
        depositRefundStatus = "PENDING";
    } else if (extraPayableAmount > 0) {
        settlementStatus = "EXTRA_PAYMENT_PENDING";
    }

    // ---------- atomic: double return nahi hoga ----------
    const updated = await Rental.findOneAndUpdate(
        { _id: rentalId, status: "ACTIVE" },
        {
            $set: {
                status: "SETTLEMENT_PENDING",
                actualReturnDate: returnDate,
                returnCondition,
                damageCharges,
                otherDeductions,
                pendingRent,
                pendingRentGST,
                totalPendingRent,
                totalDeductions,
                depositRefundAmount,
                extraPayableAmount,
                depositRefundStatus,
                settlementStatus,
                settlementNotes: String(data.settlementNotes || "").trim()
            }
        },
        { new: true, runValidators: true }
    );

    if (!updated) {
        throw new Error(
            "Rental is no longer active. Please refresh and try again."
        );
    }

    // ---------- future months cancel ----------
    await cancelInstallments(
        dues.cancelIds,
        "Cancelled - rental returned"
    );

    await syncRentalPaymentFields(rentalId);

    return {
        rental: await getRentalByIdDB(rentalId),

        settlement: {
            securityDeposit: heldDeposit,
            pendingRent,
            pendingRentGST,
            totalPendingRent,
            damageCharges,
            otherDeductions,
            totalDeductions,
            depositBalance,
            depositRefundAmount,
            extraPayableAmount,
            settlementStatus
        }
    };
};


// =====================================================
// COMPLETE RENTAL SETTLEMENT
//
// SETTLEMENT_PENDING -> COMPLETED
//
// Inventory:
//   GOOD / DAMAGED        -> available +1, rented -1
//   MISSING / HEAVILY_DAMAGED -> total -1, rented -1 (write-off)
// =====================================================

export const completeRentalSettlementService = async (
    rentalId,
    data = {},
    userId
) => {

    const rental = await getRentalByIdDB(rentalId);

    if (!rental) {
        throw new Error("Rental not found");
    }

    if (rental.status !== "SETTLEMENT_PENDING") {
        throw new Error("Rental is not waiting for settlement");
    }

    const refundAmount = Number(rental.depositRefundAmount || 0);
    const extraPayableAmount = Number(rental.extraPayableAmount || 0);

    const settlementAmountReceived = Number(
        data.settlementAmountReceived || 0
    );

    if (
        !Number.isFinite(settlementAmountReceived) ||
        settlementAmountReceived < 0
    ) {
        throw new Error("Settlement amount cannot be negative");
    }

    if (
        extraPayableAmount > 0 &&
        settlementAmountReceived < extraPayableAmount
    ) {
        throw new Error(
            `Customer must pay ₹${extraPayableAmount.toFixed(2)} before completing settlement`
        );
    }

    const paymentMethod = String(
        data.settlementPaymentMethod || "NONE"
    ).trim().toUpperCase();

    if (
        ![...ALLOWED_PAYMENT_METHODS, "NONE"].includes(paymentMethod)
    ) {
        throw new Error("Invalid settlement payment method");
    }

    // ---------- atomic claim: stock double increase nahi hoga ----------
    const claimed = await Rental.findOneAndUpdate(
        { _id: rentalId, status: "SETTLEMENT_PENDING" },
        {
            $set: {
                status: "COMPLETED",
                settlementStatus: "SETTLED",
                settlementPaymentMethod: paymentMethod,
                settlementAmountReceived,
                settlementReference: String(
                    data.settlementReference || ""
                ).trim(),
                settlementNotes: String(
                    data.settlementNotes || rental.settlementNotes || ""
                ).trim(),
                settledAt: new Date(),
                settledBy: userId || null,
                depositRefundStatus:
                    refundAmount > 0 ? "REFUNDED" : "NOT_APPLICABLE"
            }
        },
        { new: true }
    );

    if (!claimed) {
        throw new Error(
            "Settlement was already completed. Please refresh."
        );
    }

    // ---------- inventory ----------
    const writeOff = WRITE_OFF_CONDITIONS.includes(
        rental.returnCondition
    );

    const stockFilter = {
        _id: rental.rentalProductId?._id || rental.rentalProductId,
        rentedQuantity: { $gt: 0 }
    };

    if (writeOff) {
        stockFilter.totalQuantity = { $gt: 0 };
    }

    const updatedRentalProduct = await RentalProduct.findOneAndUpdate(
        stockFilter,
        writeOff
            ? { $inc: { rentedQuantity: -1, totalQuantity: -1 } }
            : { $inc: { availableQuantity: 1, rentedQuantity: -1 } },
        { new: true }
    );

    if (!updatedRentalProduct) {

        // Rental ko wapas settlement pending me daalo
        await Rental.findByIdAndUpdate(rentalId, {
            $set: {
                status: "SETTLEMENT_PENDING",
                settlementStatus: rental.settlementStatus || "PENDING",
                settledAt: null,
                settledBy: null,
                depositRefundStatus: rental.depositRefundStatus
            }
        });

        throw new Error(
            "Rental inventory update failed. Rental was not completed."
        );
    }

    // ---------- bacha hua due rent adjust ----------
    await adjustRemainingInstallments(rentalId);
    await syncRentalPaymentFields(rentalId);

    // ---------- notifications ----------
    try {

        if (writeOff) {

            await notifyAdminsService({
                type: "RENTAL_STOCK_LOW",
                title: "Rental Laptop Written Off",
                message:
                    `Rental ${rental.rentalNumber} returned as ${rental.returnCondition}. ` +
                    `1 unit removed from rental inventory (total now ${updatedRentalProduct.totalQuantity}).`,
                relatedId: updatedRentalProduct._id,
                relatedModel: "RentalProduct"
            });

        } else if (updatedRentalProduct.availableQuantity <= 5) {

            await notifyAdminsService({
                type: "RENTAL_STOCK_LOW",
                title: "Rental Stock Low",
                message:
                    `Rental stock is low. Only ${updatedRentalProduct.availableQuantity} unit(s) available.`,
                relatedId: updatedRentalProduct._id,
                relatedModel: "RentalProduct"
            });
        }

    } catch (notificationError) {

        console.error(
            "Rental notification failed:",
            notificationError.message
        );
    }

    return await getRentalByIdDB(rentalId);
};