import mongoose from "mongoose";

const serviceCatalogSchema = new mongoose.Schema(
    {
        serviceName: {
            type: String,
            required: [true, "Service name is required"],
            trim: true,
        },
        category: {
            type: String,
            enum: ["Hardware Replacement", "Hardware Repair", "Software & OS", "Maintenance", "Diagnostics"],
            default: "Hardware Repair",
        },
        partCost: {
            type: Number,
            default: 0,
            min: 0,
        },
        laborCost: {
            type: Number,
            required: [true, "Labor cost is required"],
            default: 0,
            min: 0,
        },
        totalCost: {
            type: Number,
            default: 0,
        },
        estimatedTime: {
            type: String,
            default: "1-2 hours",
        },
        description: {
            type: String,
            trim: true,
        },
        createdBy: {
            type: String,
            default: "Technician",
        },
    },
    { timestamps: true }
);

// Auto-calculate total cost before saving
// serviceCatalogSchema.pre("save", function (next) {
//     this.totalCost = (Number(this.partCost) || 0) + (Number(this.laborCost) || 0);
//     next();
// });

serviceCatalogSchema.pre("save", function () {
    this.totalCost = (Number(this.partCost) || 0) + (Number(this.laborCost) || 0);
});

const ServiceCatalog = mongoose.model("ServiceCatalog", serviceCatalogSchema);
export default ServiceCatalog;