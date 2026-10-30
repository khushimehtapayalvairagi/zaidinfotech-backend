import {
  getMyRentalsService,
  getRentalService,
  getAllRentalsService,
  markRentalReturnedService,
  createWalkInRentalService,
  searchRentalsForReturnService,
  completeRentalSettlementService,
  markRentalDepositReceivedService,
  updateRentalPricingService
} from "./rental.service.js";

// =====================================================
// AUTH HELPERS
// =====================================================

const getAuthenticatedUserId = (req) => {
  return req.user?._id || req.user?.id || null;
};

const getAuthenticatedUserRole = (req) => {
  return String(req.user?.role || "")
    .trim()
    .toUpperCase();
};

// =====================================================
// RENTAL ROLE PERMISSIONS
//
// SALES / RECEPTIONIST / ADMIN / SUPER_ADMIN
//
// All four roles:
// - Create walk-in rental
// - Standard rental pricing
// - Negotiated pricing
// - GST billing
// - NON_GST billing, where approved
//
// This configuration assumes your organization has
// explicitly approved NON_GST billing for these roles.
// =====================================================

const RENTAL_MANAGEMENT_ROLES = [
  "SALES",
  "RECEPTIONIST",
  "ADMIN",
  "SUPER_ADMIN"
];

const getRentalPricingPermissions = (req) => {
  const role = getAuthenticatedUserRole(req);

  const canNegotiate =
    RENTAL_MANAGEMENT_ROLES.includes(role);

  const allowNonGst =
    RENTAL_MANAGEMENT_ROLES.includes(role);

  return {
    role,
    canNegotiate,
    allowNonGst
  };
};

// =====================================================
// MY RENTALS (CUSTOMER)
// =====================================================

export const getMyRentalsController = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const rentals = await getMyRentalsService(userId);

    return res.status(200).json({
      success: true,
      data: rentals
    });
  } catch (error) {
    console.error("GET MY RENTALS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to fetch rentals"
    });
  }
};

// =====================================================
// SINGLE RENTAL
// =====================================================

export const getRentalController = async (req, res) => {
  try {
    const rental = await getRentalService(req.params.id);

    return res.status(200).json({
      success: true,
      data: rental
    });
  } catch (error) {
    console.error("GET RENTAL ERROR:", error);

    return res.status(404).json({
      success: false,
      message: error?.message || "Rental not found"
    });
  }
};

// =====================================================
// ALL RENTALS
// =====================================================

export const getAllRentalsController = async (req, res) => {
  try {
    const rentals = await getAllRentalsService();

    return res.status(200).json({
      success: true,
      data: rentals
    });
  } catch (error) {
    console.error("GET ALL RENTALS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to fetch rentals"
    });
  }
};

// =====================================================
// RECEIVE RENTAL RETURN
// =====================================================

export const markRentalReturnedController = async (req, res) => {
  try {
    const { rental, settlement } =
      await markRentalReturnedService(
        req.params.id,
        req.body || {}
      );

    const plain = rental?.toObject
      ? rental.toObject()
      : rental;

    return res.status(200).json({
      success: true,
      message:
        "Rental returned successfully. Settlement is pending.",
      data: {
        ...plain,
        settlement
      }
    });
  } catch (error) {
    console.error("MARK RENTAL RETURNED ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error?.message || "Failed to return rental"
    });
  }
};

// =====================================================
// CREATE WALK-IN RENTAL
//
// GST / NON_GST
// STANDARD / NEGOTIATED
// SALES / RECEPTIONIST / ADMIN / SUPER_ADMIN
//
// Existing service handles:
// - Customer validation
// - Product stock validation
// - Rental duration
// - Rent calculation
// - GST calculation
// - Security deposit
// - Installment schedule
// - Inventory reservation
// =====================================================

export const createWalkInRentalController = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required to create walk-in rental"
      });
    }

    const {
      role,
      canNegotiate,
      allowNonGst
    } = getRentalPricingPermissions(req);

    if (!RENTAL_MANAGEMENT_ROLES.includes(role)) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to create walk-in rentals"
      });
    }

    console.log("WALK-IN RENTAL REQUEST:", {
      userId: String(userId),
      role,
      canNegotiate,
      allowNonGst,
      billingType: req.body?.billingType,
      rentalDuration: req.body?.rentalDuration,
      customerType: req.body?.customerType,
      itemsCount: req.body?.items?.length || 0,
      pricingByProduct: req.body?.pricingByProduct || {}
    });

    const result = await createWalkInRentalService(
      req.body || {},
      userId,
      {
        canNegotiate,
        allowNonGst
      }
    );

    const rentalCount = result?.rentals?.length || 0;

    console.log("WALK-IN RENTAL CREATED:", {
      orderId: result?.orderId,
      rentalsCount: rentalCount,
      billingTypes: (result?.rentals || []).map(
        (rental) => rental.billingType
      ),
      warnings: result?.warnings || []
    });

    return res.status(201).json({
      success: true,
      message:
        rentalCount > 1
          ? `${rentalCount} walk-in rentals created successfully`
          : "Walk-in rental created successfully",
      data: {
        orderId: result.orderId,
        rentals: result.rentals || [],
        warnings: result.warnings || []
      }
    });
  } catch (error) {
    console.error(
      "CREATE WALK-IN RENTAL CONTROLLER ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message || "Failed to create walk-in rental"
    });
  }
};

// =====================================================
// SEARCH RENTALS FOR RETURN
// =====================================================

export const searchRentalsForReturnController = async (req, res) => {
  try {
    const search = String(req.query?.search || "").trim();

    if (!search) {
      return res.status(400).json({
        success: false,
        message:
          "Rental number or customer phone is required"
      });
    }

    const rentals =
      await searchRentalsForReturnService(search);

    return res.status(200).json({
      success: true,
      data: rentals
    });
  } catch (error) {
    console.error(
      "SEARCH RENTALS FOR RETURN ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message || "Failed to search rentals"
    });
  }
};

// =====================================================
// COMPLETE RENTAL SETTLEMENT
// =====================================================

export const completeRentalSettlementController = async (
  req,
  res
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const rental = await completeRentalSettlementService(
      req.params.id,
      req.body || {},
      userId
    );

    return res.status(200).json({
      success: true,
      message:
        "Rental settlement completed successfully",
      data: rental
    });
  } catch (error) {
    console.error(
      "COMPLETE RENTAL SETTLEMENT ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Failed to complete rental settlement"
    });
  }
};

// =====================================================
// SECURITY DEPOSIT RECEIVED
// =====================================================

export const markRentalDepositReceivedController = async (
  req,
  res
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const rental =
      await markRentalDepositReceivedService(
        req.params.id,
        req.body || {},
        userId
      );

    return res.status(200).json({
      success: true,
      message:
        "Security deposit received successfully",
      data: rental
    });
  } catch (error) {
    console.error(
      "RENTAL DEPOSIT RECEIVED ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Failed to receive security deposit"
    });
  }
};

// =====================================================
// UPDATE RENTAL PRICING
//
// SALES / RECEPTIONIST / ADMIN / SUPER_ADMIN
//
// GST / NON_GST
// STANDARD / NEGOTIATED
//
// Service prevents editing paid installments.
// =====================================================

export const updateRentalPricingController = async (
  req,
  res
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const rentalId =
      req.params.rentalId || req.params.id;

    if (!rentalId) {
      return res.status(400).json({
        success: false,
        message: "Rental ID is required"
      });
    }

    const {
      role,
      canNegotiate,
      allowNonGst
    } = getRentalPricingPermissions(req);

    if (!canNegotiate) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to update rental pricing"
      });
    }

    console.log("UPDATE RENTAL PRICING REQUEST:", {
      rentalId,
      userId: String(userId),
      role,
      canNegotiate,
      allowNonGst,
      monthlyRent: req.body?.monthlyRent,
      billingType: req.body?.billingType
    });

    const rental = await updateRentalPricingService(
      rentalId,
      req.body || {},
      userId,
      {
        canNegotiate,
        allowNonGst
      }
    );

    return res.status(200).json({
      success: true,
      message:
        "Rental pricing updated successfully",
      data: rental
    });
  } catch (error) {
    console.error(
      "UPDATE RENTAL PRICING ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Failed to update rental pricing"
    });
  }
};