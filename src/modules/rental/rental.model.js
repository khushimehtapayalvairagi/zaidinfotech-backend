import mongoose from "mongoose";

const rentalSchema = new mongoose.Schema(
    {
        // =====================================================
        // RENTAL NUMBER
        // =====================================================

        rentalNumber: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            index: true
        },

        // =====================================================
        // CUSTOMER
        // ONLINE  → customerId required
        // WALK_IN → customerId can be null
        // =====================================================

        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: function () {
                return this.rentalSource !== "WALK_IN";
            },
            default: null,
            index: true
        },

        // =====================================================
        // PRODUCT
        // =====================================================

        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true
        },

        rentalProductId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RentalProduct",
            required: true
        },

        // =====================================================
        // RENTAL SOURCE
        // =====================================================

        rentalSource: {
            type: String,
            enum: ["ONLINE", "WALK_IN"],
            default: "ONLINE",
            index: true
        },

        // =====================================================
        // CUSTOMER TYPE
        // =====================================================

        customerType: {
            type: String,
            enum: ["INDIVIDUAL", "COMPANY"],
            required: true
        },

        // =====================================================
        // INDIVIDUAL DETAILS
        // =====================================================

        individualDetails: {
            fullName: {
                type: String,
                trim: true
            },

            phone: {
                type: String,
                trim: true
            },

            email: {
                type: String,
                trim: true,
                lowercase: true
            },

            address: {
                type: String,
                trim: true
            }
        },

        // =====================================================
        // COMPANY DETAILS
        // =====================================================

        companyDetails: {
            companyName: {
                type: String,
                trim: true
            },

            contactPerson: {
                type: String,
                trim: true
            },

            phone: {
                type: String,
                trim: true
            },

            email: {
                type: String,
                trim: true,
                lowercase: true
            },

            officeAddress: {
                type: String,
                trim: true
            },

            gstNumber: {
                type: String,
                trim: true,
                uppercase: true
            }
        },

        // =====================================================
        // RENTAL PRICING
        // =====================================================

        monthlyRent: {
            type: Number,
            required: true,
            min: 0
        },

        gstPercentage: {
            type: Number,
            default: 0,
            min: 0
        },

        securityDeposit: {
            type: Number,
            required: true,
            min: 0
        },

        // =====================================================
        // RENTAL PERIOD
        // =====================================================
rentalDurationType: {
    type: String,
    enum: ["DAYS", "MONTHS"],
    required: true
},

rentalDuration: {
    type: Number,
    required: true,
    min: 1
},

        startDate: {
            type: Date,
            default: null
        },

        expectedEndDate: {
            type: Date,
            default: null
        },

        actualReturnDate: {
            type: Date,
            default: null
        },

        // =====================================================
        // PAYMENT DATES
        // =====================================================

        nextPaymentDate: {
            type: Date,
            default: null
        },

        lastPaymentDate: {
            type: Date,
            default: null
        },

        // =====================================================
        // RENTAL STATUS
        // =====================================================

      status: {
    type: String,
    enum: [
        "ACTIVE",
        "RETURN_REQUESTED",
        "SETTLEMENT_PENDING",
        "COMPLETED",
        "CANCELLED"
    ],
    default: "ACTIVE",
    index: true
},

      

        returnCondition: {
            type: String,
            enum: [
                "GOOD",
                "DAMAGED",
                "HEAVILY_DAMAGED",
                "MISSING"
            ],
            default: null
        },

        damageCharges: {
            type: Number,
            default: 0,
            min: 0
        },

        otherDeductions: {
            type: Number,
            default: 0,
            min: 0
        },

        pendingRent: {
            type: Number,
            default: 0,
            min: 0
        },

        pendingRentGST: {
            type: Number,
            default: 0,
            min: 0
        },

        totalPendingRent: {
            type: Number,
            default: 0,
            min: 0
        },

        totalDeductions: {
            type: Number,
            default: 0,
            min: 0
        },

        extraPayableAmount: {
            type: Number,
            default: 0,
            min: 0
        },

        // =====================================================
        // SECURITY DEPOSIT REFUND
        // =====================================================

        depositRefundAmount: {
            type: Number,
            default: 0,
            min: 0
        },

        // =====================================================
        // SECURITY DEPOSIT REFUND
        // =====================================================

        depositRefundAmount: {
            type: Number,
            default: 0,
            min: 0
        },

        depositRefundStatus: {
            type: String,
            enum: [
                "NOT_APPLICABLE",
                "PENDING",
                "PARTIAL",
                "REFUNDED"
            ],
            default: "PENDING"
        },

        securityDepositPaymentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payment",
            default: null
        },

        // =====================================================
        // ALLOCATION
        // =====================================================

        allocatedAt: {
            type: Date,
            default: null
        },

        allocatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        // =====================================================
     

        // =====================================================
        // NOTES
        // =====================================================

        notes: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

// =====================================================
// INDEXES
// =====================================================

rentalSchema.index({
    customerId: 1,
    status: 1
});

rentalSchema.index({
    productId: 1,
    status: 1
});

rentalSchema.index({
    rentalSource: 1,
    status: 1
});

// =====================================================
// MODEL
// =====================================================

const Rental = mongoose.model(
    "Rental",
    rentalSchema
);

export default Rental;