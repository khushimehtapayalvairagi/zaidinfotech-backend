import mongoose from "mongoose";

const rentalSchema = new mongoose.Schema(
    {
        rentalNumber: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            index: true
        },

        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

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

        customerType: {
            type: String,
            enum: ["INDIVIDUAL", "COMPANY"],
            required: true
        },

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

        rentalMonths: {
            type: Number,
            required: true,
            min: 3
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

        nextPaymentDate: {
            type: Date,
            default: null
        },

        lastPaymentDate: {
            type: Date,
            default: null
        },

        status: {
            type: String,
            enum: [
                "PENDING",
                "DOCUMENT_VERIFICATION",
                "APPROVED",
                "DEPOSIT_PENDING",
                "READY_FOR_ALLOCATION",
                "ACTIVE",
                "RETURN_REQUESTED",
                "RETURNED",
                "SETTLEMENT_PENDING",
                "COMPLETED",
                "REJECTED",
                "CANCELLED"
            ],
            default: "PENDING",
            index: true
        },

        rejectionReason: {
            type: String,
            default: ""
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

        allocatedAt: {
            type: Date,
            default: null
        },

        allocatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        approvedAt: {
            type: Date,
            default: null
        },

        notes: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

rentalSchema.index({
    customerId: 1,
    status: 1
});

rentalSchema.index({
    productId: 1,
    status: 1
});

const Rental = mongoose.model("Rental", rentalSchema);

export default Rental;