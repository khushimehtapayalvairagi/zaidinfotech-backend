import mongoose from "mongoose";

const shipmentTrackingSchema = new mongoose.Schema(
{
    shipmentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Shipment",
        required:true,
        index:true
    },

    status:{
        type:String,
        required:true
    },

    location:{
        type:String,
        default:""
    },

    description:{
        type:String,
        default:""
    },

    updatedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }

},
{
    timestamps:true
});


const ShipmentTracking = mongoose.model(
    "ShipmentTracking",
    shipmentTrackingSchema
);


export default ShipmentTracking;