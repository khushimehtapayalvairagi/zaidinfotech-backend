import crypto from "crypto";
import mongoose from "mongoose";

import Payment from "../payments/payment.model.js";
import { notifyAdminsService } from "../notification/notification.service.js";

import Rental from "./rental.model.js";
import RentalProduct from "./rentalProduct.model.js";
import RentalPayment from "./rentalPayment.model.js";

import { createPayment } from "../payments/payment.service.js";
import { PAYMENT_STATUS } from "../../common/constants/paymentStatus.js";

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

import { CUSTOMER_SOURCE_KEYS } from "../../common/constants/customerSource.js";

import {
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

const generateRentalNumber = () =>
  `RENT-${Date.now().toString().slice(-8)}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;

const generateOrderId = () =>
  `ORD-${Date.now().toString().slice(-8)}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;

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
  let rawItems = Array.isArray(data.items)
    ? data.items
    : [];

  if (!rawItems.length && data.rentalProductId) {
    rawItems = [{
      rentalProductId: data.rentalProductId,
      quantity: data.quantity || 1
    }];
  }

  if (!rawItems.length) {
    throw new Error(
      "Please select at least one rental laptop"
    );
  }

  const merged = new Map();

  for (const raw of rawItems) {
    const id = String(
      raw?.rentalProductId || ""
    ).trim();

    const quantity = Number(
      raw?.quantity ?? 1
    );

    if (!mongoose.isValidObjectId(id)) {
      throw new Error("Invalid rental product");
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error(
        "Quantity must be a whole number of at least 1"
      );
    }

    merged.set(
      id,
      (merged.get(id) || 0) + quantity
    );
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

    const fullName = String(
      d.fullName || ""
    ).trim();

    const phone = String(
      d.phone || ""
    ).trim();

    if (!fullName) {
      throw new Error("Customer full name is required");
    }

    if (!phone) {
      throw new Error("Customer phone number is required");
    }

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

  const companyName = String(
    d.companyName || ""
  ).trim();

  const contactPerson = String(
    d.contactPerson || ""
  ).trim();

  const phone = String(
    d.phone || ""
  ).trim();

  if (!companyName) {
    throw new Error("Company name is required");
  }

  if (!contactPerson) {
    throw new Error("Contact person is required");
  }

  if (!phone) {
    throw new Error("Company phone number is required");
  }

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
// RENTAL PRICING
// =====================================================

const parseMoney = (value, label) => {
  const amount = Number(value);

  if (
    value === null ||
    value === undefined ||
    value === "" ||
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    throw new Error(
      `${label} must be a valid non-negative amount`
    );
  }

  return round2(amount);
};

const resolveRentalPricing = ({
  rentalProduct,
  pricing = {},
  canNegotiate = false,
  allowNonGst = false
}) => {
  const originalMonthlyRent = parseMoney(
    rentalProduct.monthlyRent,
    "Original monthly rent"
  );

  const requestedMonthlyRent =
    pricing.monthlyRent === undefined ||
    pricing.monthlyRent === null ||
    pricing.monthlyRent === ""
      ? originalMonthlyRent
      : parseMoney(
          pricing.monthlyRent,
          "Requested monthly rent"
        );

  if (requestedMonthlyRent <= 0) {
    throw new Error(
      "Monthly rent must be greater than zero"
    );
  }

  const pricingChanged =
    requestedMonthlyRent !== originalMonthlyRent;

  const negotiationReason = String(
    pricing.negotiationReason || ""
  ).trim();

  if (pricingChanged && !canNegotiate) {
    throw new Error(
      "Only authorized users can negotiate rent"
    );
  }

  if (pricingChanged && !negotiationReason) {
    throw new Error(
      "Negotiation reason is required when rent changes"
    );
  }

  const billingType = String(
    pricing.billingType ??
    pricing.billingMode ??
    "GST"
  ).trim().toUpperCase();

  if (!["GST", "NON_GST"].includes(billingType)) {
    throw new Error(
      "Invalid billing type. Use GST or NON_GST."
    );
  }

  if (billingType === "NON_GST" && !allowNonGst) {
    throw new Error(
      "Non-GST billing is not authorized for this rental"
    );
  }

  const configuredGst = Number(
    rentalProduct.gst ?? 0
  );

  if (
    !Number.isFinite(configuredGst) ||
    configuredGst < 0 ||
    configuredGst > 100
  ) {
    throw new Error("Invalid configured GST rate");
  }

  return {
    originalMonthlyRent,
    monthlyRent: requestedMonthlyRent,

    pricingType: pricingChanged
      ? "NEGOTIATED"
      : "STANDARD",

    negotiationReason: pricingChanged
      ? negotiationReason
      : "",

    billingType,

    gstPercentage: billingType === "NON_GST"
      ? 0
      : configuredGst
  };
};

// =====================================================
// CREATE WALK-IN RENTAL
// =====================================================

export const createWalkInRentalService = async (
  data,
  createdBy,
  pricingPermissions = {}
) => {
  if (!data) {
    throw new Error("Rental data is required");
  }

  const customerType = String(
    data.customerType || ""
  ).toUpperCase();

  if (!["INDIVIDUAL", "COMPANY"].includes(customerType)) {
    throw new Error("Invalid customer type");
  }

  const items = normalizeItems(data);

  const totalUnits = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

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

  const {
    individualDetails,
    companyDetails
  } = buildCustomerDetails(customerType, data);

  // =====================================================
  // CUSTOMER SOURCE (OPTIONAL)
  // "How did you come to know about ZAID Infotech?"
  //
  // - Empty / missing  -> saved as null
  // - Provided         -> must be a valid key
  // - OTHER            -> free text is optional
  // =====================================================

  const rawCustomerSource = String(
    data.customerSource || ""
  )
    .trim()
    .toUpperCase();

  if (
    rawCustomerSource &&
    !CUSTOMER_SOURCE_KEYS.includes(rawCustomerSource)
  ) {
    throw new Error("Invalid customer source selected");
  }

  const customerSource = rawCustomerSource || null;

  // Free text is kept only when the source is OTHER.
  const customerSourceOther =
    customerSource === "OTHER"
      ? String(data.customerSourceOther || "")
          .trim()
          .slice(0, 200)
      : "";

  // =====================================================
  // [CHANGE] BRANCH + SALESPERSON
  //
  // WHY: The frontend already sends branchId (dropdown) but this
  // service never read it, and soldBy was never saved either.
  // Because the Rental schema has `default: null` for both
  // fields, they were silently saved as null.
  //
  // WHAT:
  //  - branchId : taken from the request body (selected in UI),
  //               validated as a proper Mongo ObjectId.
  //  - soldBy   : taken from `createdBy` (the authenticated user
  //               set by verifyToken), NOT from the request body.
  //               This way the salesperson cannot be faked from
  //               the browser (localStorage can be edited).
  //
  // Only the IDs are stored. Names are resolved at read time with
  // populate() (see rental.repository.js).
  // =====================================================

  const branchId = String(data.branchId || "").trim();

  if (!branchId) {
    throw new Error("Branch is required");
  }

  if (!mongoose.isValidObjectId(branchId)) {
    throw new Error("Invalid branch selected");
  }

  const soldBy = String(createdBy || "").trim();

  if (!mongoose.isValidObjectId(soldBy)) {
    throw new Error("Invalid salesperson");
  }

  // Load products
  const rentalProducts = await RentalProduct.find({
    _id: {
      $in: items.map((item) => item.rentalProductId)
    }
  }).populate("productId");

  const productMap = new Map(
    rentalProducts.map((product) => [
      String(product._id),
      product
    ])
  );

  const canNegotiate =
    pricingPermissions.canNegotiate === true;

  const allowNonGst =
    pricingPermissions.allowNonGst === true;

  const pricingByProduct =
    data.pricingByProduct &&
    typeof data.pricingByProduct === "object" &&
    !Array.isArray(data.pricingByProduct)
      ? data.pricingByProduct
      : {};

  const lines = [];

  for (const item of items) {
    const rentalProduct = productMap.get(
      item.rentalProductId
    );

    if (!rentalProduct) {
      throw new Error("Rental product not found");
    }

    const name =
      rentalProduct.productId?.name ||
      "Rental laptop";

    if (rentalProduct.status !== "ACTIVE") {
      throw new Error(`${name} is inactive`);
    }

    if (rentalProduct.isAvailableForRent !== true) {
      throw new Error(
        `${name} is not available for rent`
      );
    }

    const available = Number(
      rentalProduct.availableQuantity || 0
    );

    if (available < item.quantity) {
      throw new Error(
        available <= 0
          ? `${name} is out of stock`
          : `Only ${available} unit(s) of ${name} available`
      );
    }

    if (Number(rentalProduct.monthlyRent || 0) <= 0) {
      throw new Error(
        `Monthly rent is not set for ${name}`
      );
    }

    // Support both pricingByProduct and items[] pricing
    const itemPayload = Array.isArray(data.items)
      ? data.items.find(
          (entry) =>
            String(entry.rentalProductId) ===
            String(rentalProduct._id)
        )
      : null;

    const productPricing =
      pricingByProduct[String(rentalProduct._id)] || {};

    const requestedPricing = {
      monthlyRent:
        productPricing.monthlyRent ??
        itemPayload?.monthlyRent ??
        itemPayload?.negotiatedMonthlyRent ??
        rentalProduct.monthlyRent,

      negotiationReason:
        productPricing.negotiationReason ??
        itemPayload?.negotiationReason ??
        "",

      billingType:
        productPricing.billingType ??
        productPricing.billingMode ??
        itemPayload?.billingType ??
        data.billingType ??
        (data.gstApplicable === false ? "NON_GST" : "GST")
    };

    const pricing = resolveRentalPricing({
      rentalProduct,
      pricing: requestedPricing,
      canNegotiate,
      allowNonGst
    });

    lines.push({
      rentalProduct,
      quantity: item.quantity,
      name,
      pricing
    });
  }

  // Duration
  const rentalDurationType = String(
    data.rentalDurationType || ""
  ).toUpperCase();

  const rentalDuration = Number(
    data.rentalDuration || 0
  );

  if (rentalDurationType !== "MONTHS") {
    throw new Error(
      "Rental duration must be in MONTHS. Minimum 3 months required."
    );
  }

  if (
    !Number.isInteger(rentalDuration) ||
    rentalDuration < 3
  ) {
    throw new Error(
      "Minimum rental duration is 3 months."
    );
  }

  const productMinMonths = Math.max(
    3,
    ...lines.map((line) =>
      Number(line.rentalProduct.minimumRentalMonths || 3)
    )
  );

  if (rentalDuration < productMinMonths) {
    throw new Error(
      `Minimum rental period is ${productMinMonths} months`
    );
  }

  if (
    customerType === "COMPANY" &&
    rentalDuration < COMPANY_MIN_MONTHS
  ) {
    throw new Error(
      `Company rental must be for a minimum of ${COMPANY_MIN_MONTHS} months`
    );
  }

  // Deposit
  const unitDeposits = [];

  for (const line of lines) {
    for (let unit = 0; unit < line.quantity; unit++) {
      unitDeposits.push(
        round2(line.rentalProduct.securityDeposit || 0)
      );
    }
  }

  const totalDeposit = round2(
    unitDeposits.reduce(
      (sum, amount) => sum + amount,
      0
    )
  );

  const depositPaidTotal =
    data.depositAmountPaid === undefined ||
    data.depositAmountPaid === null ||
    data.depositAmountPaid === ""
      ? 0
      : parseMoney(
          data.depositAmountPaid,
          "Deposit paid"
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

    if (
      !ALLOWED_PAYMENT_METHODS.includes(
        depositPaymentMethod
      )
    ) {
      throw new Error(
        "Valid deposit payment method is required"
      );
    }
  }

  // Rent payment
  const rentPaidNow = data.rentPaidNow === true;

  const rentPaymentMethod = normalizePaymentMethod(
    data.rentPaymentMethod
  );

  const rentPaymentReference = String(
    data.rentPaymentReference || ""
  ).trim();

  if (rentPaidNow) {
    if (
      !ALLOWED_PAYMENT_METHODS.includes(
        rentPaymentMethod
      )
    ) {
      throw new Error(
        "Valid rent payment method is required"
      );
    }

    if (
      rentPaymentMethod !== "CASH" &&
      !rentPaymentReference
    ) {
      throw new Error(
        "Rent payment reference / transaction number is required"
      );
    }
  }

  const startDate = new Date();

  const expectedEndDate = addMonths(
    startDate,
    rentalDuration
  );

  // Reserve stock
  const reserved = [];

  try {
    for (const line of lines) {
      const updated = await RentalProduct.findOneAndUpdate(
        {
          _id: line.rentalProduct._id,
          status: "ACTIVE",
          isAvailableForRent: true,
          availableQuantity: {
            $gte: line.quantity
          }
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

  const orderId = generateOrderId();

  let createdRentals = [];
  let createdSchedules = [];

  try {
    const rentalDocs = [];

    let unitIndex = 0;
    let remainingDeposit = depositPaidTotal;

    for (const line of lines) {
      const rp = line.rentalProduct;

      const {
        monthlyRent,
        gstPercentage
      } = line.pricing;

      const unitRent = round2(
        monthlyRent * rentalDuration
      );

      const monthlyGST = round2(
        (monthlyRent * gstPercentage) / 100
      );

      const unitGst = round2(
        monthlyGST * rentalDuration
      );

      const unitRentTotal = round2(
        unitRent + unitGst
      );

      for (let unit = 0; unit < line.quantity; unit++) {
        const unitDeposit = unitDeposits[unitIndex++];

        const allocated = unitDeposit > 0
          ? round2(
              Math.min(
                remainingDeposit,
                unitDeposit
              )
            )
          : 0;

        remainingDeposit = round2(
          remainingDeposit - allocated
        );

        const depositStatus =
          unitDeposit <= 0 || allocated >= unitDeposit
            ? "PAID"
            : allocated > 0
              ? "PARTIAL"
              : "UNPAID";

        rentalDocs.push({
          rentalNumber: generateRentalNumber(),
          orderId,

          // [CHANGE] Save branch + salesperson on EVERY rental unit.
          // Previously these two fields were missing here, so Mongoose
          // filled them with the schema default (null).
          branchId,
          soldBy,

          customerId: null,

          productId:
            rp.productId?._id || rp.productId,

          rentalProductId: rp._id,

          rentalSource: "WALK_IN",

          // How did the customer come to know about us (optional)
          customerSource,
          customerSourceOther,

          customerType,
          individualDetails,
          companyDetails,

          originalMonthlyRent:
            line.pricing.originalMonthlyRent,

          monthlyRent,
          gstPercentage,

          pricingType:
            line.pricing.pricingType,

          billingType:
            line.pricing.billingType,

          negotiationReason:
            line.pricing.negotiationReason,

          pricingUpdatedBy:
            line.pricing.pricingType === "NEGOTIATED"
              ? createdBy || null
              : null,

          pricingUpdatedAt:
            line.pricing.pricingType === "NEGOTIATED"
              ? new Date()
              : null,

          pricingHistory:
            line.pricing.pricingType === "NEGOTIATED"
              ? [{
                  oldMonthlyRent:
                    line.pricing.originalMonthlyRent,

                  newMonthlyRent: monthlyRent,

                  oldBillingType: "GST",

                  newBillingType:
                    line.pricing.billingType,

                  oldGstPercentage:
                    Number(rp.gst || 0),

                  newGstPercentage: gstPercentage,

                  reason:
                    line.pricing.negotiationReason,

                  changedBy: createdBy || null,
                  changedAt: new Date()
                }]
              : [],

          securityDeposit: unitDeposit,

          rentSubtotal: unitRent,
          rentGstAmount: unitGst,
          rentTotalAmount: unitRentTotal,

          rentPaidAmount: 0,
          rentBalanceAmount: unitRentTotal,
          rentPaymentStatus: "PENDING",

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
      throw new Error(
        "No rental documents were prepared"
      );
    }

    createdRentals = await Rental.insertMany(
      rentalDocs
    );

    if (createdRentals.length !== rentalDocs.length) {
      throw new Error(
        "Not all rental records were inserted successfully"
      );
    }

    const insertedIds = createdRentals.map(
      (rental) => rental._id
    );

    const persistedRentals = await Rental.find({
      _id: {
        $in: insertedIds
      }
    }).lean();

    if (persistedRentals.length !== insertedIds.length) {
      throw new Error(
        "Rental records were inserted but could not be verified in the database"
      );
    }

    if (
      persistedRentals.some(
        (rental) =>
          String(rental.orderId || "") !== orderId
      )
    ) {
      throw new Error(
        "Saved rentals are missing the correct orderId. Check rental.model.js and restart the backend."
      );
    }

    // Create installments
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
      "CREATE WALK-IN RENTAL ERROR:",
      error
    );

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

  // First installment payment
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

  // Sync payment summary
  for (const rental of createdRentals) {
    try {
      await syncRentalPaymentFields(rental._id);
    } catch (error) {
      console.error(
        "RENTAL PAYMENT SYNC ERROR:",
        String(rental._id),
        error
      );

      warnings.push(
        `Payment summary sync failed for ${rental.rentalNumber}`
      );
    }
  }

  // Low stock notifications
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
      } catch (error) {
        console.error(
          "Rental stock notification failed:",
          error.message
        );
      }
    }
  }

  // Final response
  // [CHANGE] Added populate("branchId") and populate("soldBy") so the
  // API response contains branch name + salesperson name instead of
  // raw IDs. This only affects the response; the saved document still
  // stores IDs only.
  let rentals = await Rental.find({ orderId })
    .populate({
      path: "productId",
      populate: [
        { path: "brand" },
        { path: "category" }
      ]
    })
    .populate("rentalProductId")
    .populate("branchId", "name")
    .populate("soldBy", "firstName lastName name email")
    .sort({ createdAt: 1 });

  if (!rentals.length && createdRentals.length) {
    // [CHANGE] Same two populate lines added to the fallback query.
    rentals = await Rental.find({
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
      .populate("branchId", "name")
      .populate("soldBy", "firstName lastName name email")
      .sort({ createdAt: 1 });
  }

  if (!rentals.length) {
    throw new Error(
      "Rental creation could not be verified. Check backend logs."
    );
  }

  return {
    orderId,
    rentals,
    warnings
  };
};

// =====================================================
// MARK SECURITY DEPOSIT RECEIVED
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
    String(rental.rentalSource || "").toUpperCase() !==
    "WALK_IN"
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
    throw new Error(
      "Valid deposit payment method is required"
    );
  }

  const securityDeposit = Number(
    rental.securityDeposit || 0
  );

  const depositAmount = Number(
    data?.amount ??
    data?.depositAmount ??
    securityDeposit
  );

  if (
    !Number.isFinite(depositAmount) ||
    depositAmount < 0
  ) {
    throw new Error(
      "Invalid security deposit amount"
    );
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
    throw new Error(
      "Security deposit has already been received"
    );
  }

  if (
    securityDeposit > 0 &&
    Number(rental.depositAmountPaid || 0) > 0
  ) {
    throw new Error(
      "Deposit already recorded (fully or partially). Reconcile the existing deposit before receiving it again."
    );
  }

  const existingDeposit = await Payment.findOne({
    paymentFor: "RENTAL",
    referenceId: rental._id,
    paymentType: "SECURITY_DEPOSIT",
    paymentStatus: PAYMENT_STATUS.SUCCESS,
    isDeleted: false
  });

  if (existingDeposit) {
    const updated = await updateRentalDB(
      rentalId,
      {
        securityDepositPaymentId: existingDeposit._id,
        depositPaymentStatus: "PAID",
        depositPaid: true,
        depositAmountPaid: securityDeposit,

        depositPaidAt:
          existingDeposit.paidAt || new Date(),

        depositPaymentMethod:
          existingDeposit.paymentMethod,

        depositPaymentReference:
          existingDeposit.transactionId || ""
      }
    );

    if (!updated) {
      throw new Error(
        "Failed to link existing deposit payment"
      );
    }

    return await getRentalByIdDB(rentalId);
  }

  if (depositAmount === 0) {
    const updated = await updateRentalDB(
      rentalId,
      {
        depositPaymentStatus: "PAID",
        depositPaid: true,
        depositAmountPaid: 0,
        depositPaidAt: new Date(),
        depositPaymentMethod: paymentMethod,
        securityDepositPaymentId: null
      }
    );

    if (!updated) {
      throw new Error(
        "Failed to mark deposit as received"
      );
    }

    return await getRentalByIdDB(rentalId);
  }

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
        data?.transactionId ||
        data?.referenceNumber ||
        ""
      ).trim(),

      gatewayPaymentId: "",
      gatewayResponse: {},
      paymentDate: new Date(),
      paidAt: new Date()
    });
  } catch (error) {
    console.error(
      "SECURITY DEPOSIT PAYMENT CREATE ERROR:",
      error
    );

    throw new Error(
      error?.message ||
      "Failed to create security deposit payment"
    );
  }

  try {
    const updated = await updateRentalDB(
      rentalId,
      {
        securityDepositPaymentId: payment._id,
        depositPaymentStatus: "PAID",
        depositPaid: true,
        depositAmountPaid: depositAmount,
        depositPaidAt: new Date(),
        depositPaymentMethod: paymentMethod,

        depositPaymentReference: String(
          data?.transactionId ||
          data?.referenceNumber ||
          ""
        ).trim()
      }
    );

    if (!updated) {
      throw new Error(
        "Failed to update rental with deposit payment"
      );
    }

    return await getRentalByIdDB(rentalId);
  } catch (error) {
    console.error(
      "RENTAL DEPOSIT UPDATE ERROR:",
      error
    );

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
      error?.message ||
      "Failed to record security deposit"
    );
  }
};

// =====================================================
// GET RENTALS
// =====================================================

export const getMyRentalsService = async (customerId) =>
  await getCustomerRentalsDB(customerId);

export const getRentalService = async (rentalId) => {
  const rental = await getRentalByIdDB(rentalId);

  if (!rental) {
    throw new Error("Rental not found");
  }

  return rental;
};

export const getAllRentalsService = async () =>
  await getAllRentalsDB();

export const searchRentalsForReturnService = async (
  search
) => {
  const value = String(search || "").trim();

  if (!value) {
    throw new Error(
      "Rental number or customer phone is required"
    );
  }

  return await searchActiveRentalsForReturnDB(value);
};

// =====================================================
// MARK RENTAL RETURNED
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
    throw new Error(
      "Only active rental can be returned"
    );
  }

  const returnCondition = String(
    data.returnCondition || ""
  ).trim().toUpperCase();

  if (
    ![
      "GOOD",
      "DAMAGED",
      "HEAVILY_DAMAGED",
      "MISSING"
    ].includes(returnCondition)
  ) {
    throw new Error("Invalid return condition");
  }

  const enteredPendingRent = Number(
    data.pendingRent || 0
  );

  const damageCharges = Number(
    data.damageCharges || 0
  );

  const otherDeductions = Number(
    data.otherDeductions || 0
  );

  for (const [label, value] of [
    ["Pending rent", enteredPendingRent],
    ["Damage charges", damageCharges],
    ["Other deductions", otherDeductions]
  ]) {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(
        `${label} cannot be negative`
      );
    }
  }

  const returnDate = new Date();

  const dues = await calculateReturnDues(
    rental,
    returnDate
  );

  const pendingRent = round2(
    Math.max(
      enteredPendingRent,
      dues.pendingRent
    )
  );

  const additionalRent = round2(
    Math.max(
      0,
      pendingRent - dues.pendingRent
    )
  );

  const gstPercentage =
    rental.billingType === "NON_GST"
      ? 0
      : Number(rental.gstPercentage || 0);

  const additionalGST = round2(
    (additionalRent * gstPercentage) / 100
  );

  const pendingRentGST = round2(
    dues.pendingRentGST + additionalGST
  );

  const totalPendingRent = round2(
    pendingRent + pendingRentGST
  );

  const totalDeductions = round2(
    totalPendingRent +
    damageCharges +
    otherDeductions
  );

  const heldDeposit = round2(
    Math.min(
      Number(rental.depositAmountPaid || 0),
      Number(rental.securityDeposit || 0)
    )
  );

  const depositBalance = round2(
    heldDeposit - totalDeductions
  );

  const depositRefundAmount = Math.max(
    depositBalance,
    0
  );

  const extraPayableAmount = Math.max(
    -depositBalance,
    0
  );

  let depositRefundStatus = "NOT_APPLICABLE";
  let settlementStatus = "PENDING";

  if (depositRefundAmount > 0) {
    depositRefundStatus = "PENDING";
  } else if (extraPayableAmount > 0) {
    settlementStatus = "EXTRA_PAYMENT_PENDING";
  }

  const updated = await Rental.findOneAndUpdate(
    {
      _id: rentalId,
      status: "ACTIVE"
    },
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

        settlementNotes: String(
          data.settlementNotes || ""
        ).trim()
      }
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!updated) {
    throw new Error(
      "Rental is no longer active. Please refresh and try again."
    );
  }

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
    throw new Error(
      "Rental is not waiting for settlement"
    );
  }

  const refundAmount = Number(
    rental.depositRefundAmount || 0
  );

  const extraPayableAmount = Number(
    rental.extraPayableAmount || 0
  );

  const settlementAmountReceived = Number(
    data.settlementAmountReceived || 0
  );

  if (
    !Number.isFinite(settlementAmountReceived) ||
    settlementAmountReceived < 0
  ) {
    throw new Error(
      "Settlement amount cannot be negative"
    );
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
    ![
      ...ALLOWED_PAYMENT_METHODS,
      "NONE"
    ].includes(paymentMethod)
  ) {
    throw new Error(
      "Invalid settlement payment method"
    );
  }

  const claimed = await Rental.findOneAndUpdate(
    {
      _id: rentalId,
      status: "SETTLEMENT_PENDING"
    },
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
          data.settlementNotes ||
          rental.settlementNotes ||
          ""
        ).trim(),

        settledAt: new Date(),
        settledBy: userId || null,

        depositRefundStatus:
          refundAmount > 0
            ? "REFUNDED"
            : "NOT_APPLICABLE"
      }
    },
    {
      new: true
    }
  );

  if (!claimed) {
    throw new Error(
      "Settlement was already completed. Please refresh."
    );
  }

  const writeOff = WRITE_OFF_CONDITIONS.includes(
    rental.returnCondition
  );

  const stockFilter = {
    _id:
      rental.rentalProductId?._id ||
      rental.rentalProductId,

    rentedQuantity: {
      $gt: 0
    }
  };

  if (writeOff) {
    stockFilter.totalQuantity = {
      $gt: 0
    };
  }

  const updatedRentalProduct =
    await RentalProduct.findOneAndUpdate(
      stockFilter,

      writeOff
        ? {
            $inc: {
              rentedQuantity: -1,
              totalQuantity: -1
            }
          }
        : {
            $inc: {
              availableQuantity: 1,
              rentedQuantity: -1
            }
          },

      { new: true }
    );

  if (!updatedRentalProduct) {
    await Rental.findByIdAndUpdate(
      rentalId,
      {
        $set: {
          status: "SETTLEMENT_PENDING",

          settlementStatus:
            rental.settlementStatus || "PENDING",

          settledAt: null,
          settledBy: null,

          depositRefundStatus:
            rental.depositRefundStatus
        }
      }
    );

    throw new Error(
      "Rental inventory update failed. Rental was not completed."
    );
  }

  await adjustRemainingInstallments(rentalId);
  await syncRentalPaymentFields(rentalId);

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
    } else if (
      updatedRentalProduct.availableQuantity <= 5
    ) {
      await notifyAdminsService({
        type: "RENTAL_STOCK_LOW",
        title: "Rental Stock Low",

        message:
          `Rental stock is low. Only ${updatedRentalProduct.availableQuantity} unit(s) available.`,

        relatedId: updatedRentalProduct._id,
        relatedModel: "RentalProduct"
      });
    }
  } catch (error) {
    console.error(
      "Rental notification failed:",
      error.message
    );
  }

  return await getRentalByIdDB(rentalId);
};

// =====================================================
// UPDATE RENTAL PRICING
// Requires MongoDB transaction support
// =====================================================

export const updateRentalPricingService = async (
  rentalId,
  data = {},
  userId,
  permissions = {}
) => {
  if (!mongoose.isValidObjectId(rentalId)) {
    throw new Error("Invalid rental ID");
  }

  if (
    !userId ||
    permissions.canNegotiate !== true
  ) {
    throw new Error(
      "You are not authorized to update rental pricing"
    );
  }

  const reason = String(
    data.negotiationReason || ""
  ).trim();

  if (!reason) {
    throw new Error(
      "Reason for pricing update is required"
    );
  }

  const session = await mongoose.startSession();

  try {
    let updatedRental;

    await session.withTransaction(async () => {
      const rental = await Rental.findById(
        rentalId
      ).session(session);

      if (!rental) {
        throw new Error("Rental not found");
      }

      if (rental.status !== "ACTIVE") {
        throw new Error(
          "Pricing can be edited only for active rentals"
        );
      }

      const installments = await RentalPayment.find({
        rentalId
      }).session(session);

      if (!installments.length) {
        throw new Error(
          "Rental payment schedule not found"
        );
      }

      const hasRentPayment = installments.some(
        (inst) =>
          Number(inst.paidAmount || 0) > 0 ||
          (inst.payments || []).length > 0 ||
          !["PENDING", "PARTIAL"].includes(inst.status)
      );

      if (hasRentPayment) {
        throw new Error(
          "Rent payment or installment adjustment already exists. Use a separate approved financial adjustment instead of editing the original price."
        );
      }

      const rentalProduct = await RentalProduct.findById(
        rental.rentalProductId
      ).session(session);

      if (!rentalProduct) {
        throw new Error(
          "Rental product configuration not found"
        );
      }

      const oldMonthlyRent = Number(
        rental.monthlyRent || 0
      );

      const oldBillingType =
        rental.billingType || "GST";

      const oldGstPercentage = Number(
        rental.gstPercentage || 0
      );

      const pricing = resolveRentalPricing({
        rentalProduct,

        pricing: {
          monthlyRent:
            data.monthlyRent ?? rental.monthlyRent,

          billingType:
            data.billingType ??
            rental.billingType ??
            "GST",

          negotiationReason: reason
        },

        canNegotiate:
          permissions.canNegotiate === true,

        allowNonGst:
          permissions.allowNonGst === true
      });

      const definitions = buildScheduleDefinitions({
        startDate: rental.startDate,

        rentalDurationType:
          rental.rentalDurationType,

        rentalDuration:
          rental.rentalDuration,

        monthlyRent:
          pricing.monthlyRent,

        gstPercentage:
          pricing.gstPercentage
      });

      if (definitions.length !== installments.length) {
        throw new Error(
          "Installment count mismatch. Pricing update cancelled."
        );
      }

      const definitionMap = new Map(
        definitions.map((definition) => [
          definition.installmentNumber,
          definition
        ])
      );

      for (const installment of installments) {
        const definition = definitionMap.get(
          installment.installmentNumber
        );

        if (!definition) {
          throw new Error(
            "Installment schedule mismatch"
          );
        }

        const result = await RentalPayment.updateOne(
          {
            _id: installment._id,
            status: "PENDING",
            paidAmount: 0,
            "payments.0": {
              $exists: false
            }
          },
          {
            $set: {
              rentAmount:
                definition.rentAmount,

              gstAmount:
                definition.gstAmount,

              totalAmount:
                definition.totalAmount
            }
          },
          { session }
        );

        if (result.matchedCount !== 1) {
          throw new Error(
            "An installment changed during pricing update. Please retry."
          );
        }
      }

      const rentSubtotal = round2(
        definitions.reduce(
          (sum, item) => sum + item.rentAmount,
          0
        )
      );

      const rentGstAmount = round2(
        definitions.reduce(
          (sum, item) => sum + item.gstAmount,
          0
        )
      );

      const rentTotalAmount = round2(
        definitions.reduce(
          (sum, item) => sum + item.totalAmount,
          0
        )
      );

      const updated = await Rental.findOneAndUpdate(
        {
          _id: rentalId,
          status: "ACTIVE",
          monthlyRent: oldMonthlyRent,
          gstPercentage: oldGstPercentage
        },
        {
          $set: {
            originalMonthlyRent:
              rental.originalMonthlyRent ??
              Number(rentalProduct.monthlyRent),

            monthlyRent:
              pricing.monthlyRent,

            pricingType:
              pricing.pricingType,

            billingType:
              pricing.billingType,

            gstPercentage:
              pricing.gstPercentage,

            negotiationReason: reason,

            pricingUpdatedBy: userId,
            pricingUpdatedAt: new Date(),

            rentSubtotal,
            rentGstAmount,
            rentTotalAmount,

            rentPaidAmount: 0,
            rentBalanceAmount: rentTotalAmount,
            rentPaymentStatus: "PENDING"
          },

          $push: {
            pricingHistory: {
              oldMonthlyRent,

              newMonthlyRent:
                pricing.monthlyRent,

              oldBillingType,

              newBillingType:
                pricing.billingType,

              oldGstPercentage,

              newGstPercentage:
                pricing.gstPercentage,

              reason,
              changedBy: userId,
              changedAt: new Date()
            }
          }
        },
        {
          new: true,
          runValidators: true,
          session
        }
      );

      if (!updated) {
        throw new Error(
          "Rental changed during pricing update"
        );
      }

      updatedRental = updated;
    });

    return updatedRental;
  } finally {
    await session.endSession();
  }
};