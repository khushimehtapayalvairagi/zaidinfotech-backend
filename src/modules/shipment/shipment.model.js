import mongoose from "mongoose";

import { SHIPMENT_STATUS } from "../../common/constants/shipmentStatus.js";
import { SHIPMENT_FOR } from "../../common/constants/shipmentFor.js";

const shipmentSchema = new mongoose.Schema(
{
    // Customer
    user:{

        type:mongoose.Schema.Types.ObjectId,

        ref:"User",

        required:true,

        index:true

    },

    // ORDER / REPAIR / RENTAL
    shipmentFor:{

        type:String,

        enum:Object.values(SHIPMENT_FOR),

        required:true

    },

    // OrderId / RepairId / RentalId
    referenceId:{

        type:mongoose.Schema.Types.ObjectId,

        required:true,

        index:true

    },

    // Courier Company
    courierPartner:{

        type:String,

        default:""

    },

    // Tracking Number
    trackingNumber:{

        type:String,

        default:"",

        trim:true

    },

    // Tracking URL
    trackingUrl:{

        type:String,

        default:""

    },

    // Shipment Status
    shipmentStatus:{

        type:String,

        enum:Object.values(SHIPMENT_STATUS),

        default:SHIPMENT_STATUS.PENDING

    },

    // Dispatch Date
    dispatchDate:{

        type:Date

    },

    // Estimated Delivery Date
    expectedDeliveryDate:{

        type:Date

    },

    // Delivered Date
    deliveredAt:{

        type:Date

    },

    // Notes
    notes:{

        type:String,

        default:""

    },

    // Soft Delete
    isDeleted:{

        type:Boolean,

        default:false

    }

},
{
    timestamps:true
}
);

// Helpful Indexes
shipmentSchema.index({

    shipmentFor:1,

    referenceId:1

});

const Shipment = mongoose.model(

    "Shipment",

    shipmentSchema

);

export default Shipment;