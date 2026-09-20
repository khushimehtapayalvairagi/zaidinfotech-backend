import mongoose from "mongoose";

import { SHIPMENT_STATUS } from "../../common/constants/shipmentStatus.js";
import { SHIPMENT_FOR } from "../../common/constants/shipmentFor.js";
import { BLUEDART_PRODUCT } from "../../common/constants/blueDartProduct.js";

const shipmentSchema = new mongoose.Schema(
  {

    // ==================================================
    // CUSTOMER
    // ==================================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },


    // ==================================================
    // ORDER / REPAIR / RENTAL
    // ==================================================

    shipmentFor: {
      type: String,
      enum: Object.values(SHIPMENT_FOR),
      required: true
    },


    // ==================================================
    // BLUE DART PRODUCT
    // ==================================================

    blueDartProduct: {
      type: String,
      enum: Object.values(BLUEDART_PRODUCT),
      default: null
    },

         packageDetails: {

  pieceCount: {
    type: Number,
    min: 1,
    default: 1
  },

  actualWeight: {
    type: Number,
    min: 0.01,
    default: null
  },

  length: {
    type: Number,
    min: 0,
    default: null
  },

  breadth: {
    type: Number,
    min: 0,
    default: null
  },

  height: {
    type: Number,
    min: 0,
    default: null
  }

},
    // ==================================================
    // ORDER ID / REPAIR ID / RENTAL ID
    // ==================================================

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },


    // ==================================================
    // COURIER COMPANY
    // ==================================================

    courierPartner: {
      type: String,
      default: ""
    },


    // ==================================================
    // TRACKING NUMBER / AWB
    // ==================================================

    trackingNumber: {
      type: String,
      default: "",
      trim: true
    },


    trackingUrl: {
      type: String,
      default: ""
    },


    // ==================================================
    // SHIPMENT STATUS
    // ==================================================

    shipmentStatus: {
      type: String,
      enum: Object.values(SHIPMENT_STATUS),
      default: SHIPMENT_STATUS.PENDING
    },


    // ==================================================
    // DISPATCH DATE
    // ==================================================

    dispatchDate: {
      type: Date
    },


    // ==================================================
    // EXPECTED DELIVERY DATE
    // ==================================================

    expectedDeliveryDate: {
      type: Date
    },


    // ==================================================
    // DELIVERED DATE
    // ==================================================

    deliveredAt: {
      type: Date
    },


    // ==================================================
    // NOTES
    // ==================================================

    notes: {
      type: String,
      default: ""
    },


    // ==================================================
    // SOFT DELETE
    // ==================================================

    isDeleted: {
      type: Boolean,
      default: false
    }

  },
  {
    timestamps: true
  }
);


// ======================================================
// INDEX
// ======================================================

shipmentSchema.index({
  shipmentFor: 1,
  referenceId: 1
});


const Shipment = mongoose.model(
  "Shipment",
  shipmentSchema
);

export default Shipment;