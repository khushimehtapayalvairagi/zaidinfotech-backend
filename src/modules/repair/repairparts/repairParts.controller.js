import mongoose from "mongoose";
import RepairPart from "./repairParts.model.js";
import Repair from "../repair.model.js";

// ==========================================
// 1. GET ALL INVENTORY PARTS
// ==========================================
export const getAllParts = async (req, res, next) => {
    try {
        const { category, search, lowStock } = req.query;
        const filter = {};

        if (category && category !== "ALL") {
            filter.category = category;
        }

        if (search) {
            filter.$or = [
                { partName: { $regex: search, $options: "i" } },
                { partSku: { $regex: search, $options: "i" } },
                { locationBin: { $regex: search, $options: "i" } },
                { compatibleModels: { $elemMatch: { $regex: search, $options: "i" } } },
            ];
        }

        if (lowStock === "true") {
            filter.$expr = { $lte: ["$stockQuantity", "$minThreshold"] };
        }

        const parts = await RepairPart.find(filter).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: parts.length,
            parts,
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 2. GET SINGLE PART BY ID
// ==========================================
export const getPartById = async (req, res, next) => {
    try {
        const part = await RepairPart.findById(req.params.id);
        if (!part) {
            return res.status(404).json({ success: false, message: "Part not found in inventory." });
        }

        return res.status(200).json({ success: true, part });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 3. CREATE INVENTORY PART (Admin & Technician)
// ==========================================
export const createPart = async (req, res, next) => {
    try {
        const {
            partName,
            partSku,
            category,
            compatibleModels,
            purchaseCost,
            sellingPrice,
            stockQuantity,
            minThreshold,
            locationBin,
        } = req.body;

        // Check SKU duplicate
        const existing = await RepairPart.findOne({ partSku: partSku.trim().toUpperCase() });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: `Part SKU '${partSku.toUpperCase()}' is already registered.`,
            });
        }

        const modelsArray = Array.isArray(compatibleModels)
            ? compatibleModels
            : typeof compatibleModels === "string"
                ? compatibleModels.split(",").map((m) => m.trim()).filter(Boolean)
                : [];

        const part = await RepairPart.create({
            partName: partName.trim(),
            partSku: partSku.trim().toUpperCase(),
            category: category || "Other",
            compatibleModels: modelsArray,
            purchaseCost: Number(purchaseCost) || 0,
            sellingPrice: Number(sellingPrice) || 0,
            stockQuantity: Number(stockQuantity) || 0,
            minThreshold: Number(minThreshold) || 3,
            locationBin: locationBin ? locationBin.trim() : "RACK-A1",
        });

        return res.status(201).json({
            success: true,
            message: "Spare part registered to inventory successfully.",
            part,
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 4. UPDATE INVENTORY PART (Admin & Technician)
// ==========================================
export const updatePart = async (req, res, next) => {
    try {
        const { compatibleModels, partSku, ...rest } = req.body;
        const updatePayload = { ...rest };

        if (partSku) {
            updatePayload.partSku = partSku.trim().toUpperCase();
            const existing = await RepairPart.findOne({
                partSku: updatePayload.partSku,
                _id: { $ne: req.params.id },
            });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: `SKU '${updatePayload.partSku}' belongs to another component.`,
                });
            }
        }

        if (compatibleModels !== undefined) {
            updatePayload.compatibleModels = Array.isArray(compatibleModels)
                ? compatibleModels
                : typeof compatibleModels === "string"
                    ? compatibleModels.split(",").map((m) => m.trim()).filter(Boolean)
                    : [];
        }

        const part = await RepairPart.findByIdAndUpdate(
            req.params.id,
            updatePayload,
            { new: true, runValidators: true }
        );

        if (!part) {
            return res.status(404).json({ success: false, message: "Part not found." });
        }

        return res.status(200).json({
            success: true,
            message: "Inventory part updated successfully.",
            part,
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 5. DELETE INVENTORY PART (Admin & Technician)
// ==========================================
export const deletePart = async (req, res, next) => {
    try {
        const part = await RepairPart.findByIdAndDelete(req.params.id);
        if (!part) {
            return res.status(404).json({ success: false, message: "Part not found." });
        }

        return res.status(200).json({
            success: true,
            message: `Part '${part.partName}' (${part.partSku}) removed from warehouse stock.`,
        });
    } catch (error) {
        next(error);
    }
};

// =========================================================================
// 6. ATTACH PART TO REPAIR TICKET (Deducts Stock & Appends to partsUsed)
// =========================================================================
export const addPartToRepair = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { repairId, repairPartId, quantity = 1 } = req.body;
        const qty = Number(quantity);

        if (!repairId || !repairPartId || qty <= 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: "repairId, repairPartId, and valid quantity (> 0) are required.",
            });
        }

        // 1. Atomic deduction with stock availability check
        const part = await RepairPart.findOneAndUpdate(
            { _id: repairPartId, stockQuantity: { $gte: qty } },
            { $inc: { stockQuantity: -qty } },
            { session, new: true }
        );

        if (!part) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: "Insufficient inventory stock or part does not exist.",
            });
        }

        const unitCost = Number(part.sellingPrice) || 0;
        const totalCost = unitCost * qty;

        const usedPartEntry = {
            repairPart: part._id,
            quantity: qty,
            unitCost,
            totalCost,
        };

        // 2. Append into Repair.partsUsed and increment partsCost
        const updatedRepair = await Repair.findByIdAndUpdate(
            repairId,
            {
                $push: { partsUsed: usedPartEntry },
                $inc: { partsCost: totalCost },
            },
            { session, new: true }
        )
            .populate("partsUsed.repairPart", "partName partSku category sellingPrice locationBin")
            .populate("assignedTechnician", "name firstName lastName email");

        if (!updatedRepair) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: "Customer repair ticket not found.",
            });
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: `Successfully allocated ${qty}x ${part.partName} to ticket. Remaining stock: ${part.stockQuantity}`,
            remainingStock: part.stockQuantity,
            repair: updatedRepair,
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
};

// =========================================================================
// 7. REMOVE PART FROM REPAIR TICKET (Restores Stock & Decrements partsCost)
// =========================================================================
export const removePartFromRepair = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { repairId, partsUsedSubId } = req.params;

        const repair = await Repair.findById(repairId).session(session);
        if (!repair) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, message: "Repair ticket not found." });
        }

        // Locate the embedded subdocument inside partsUsed
        const partEntry = repair.partsUsed.id(partsUsedSubId);
        if (!partEntry) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: "Part entry not found on this repair ticket.",
            });
        }

        // 1. Restore stock to RepairPart collection
        await RepairPart.findByIdAndUpdate(
            partEntry.repairPart,
            { $inc: { stockQuantity: partEntry.quantity } },
            { session }
        );

        const costToDeduct = partEntry.totalCost || 0;

        // 2. Remove subdocument and update partsCost
        repair.partsUsed.pull(partsUsedSubId);
        repair.partsCost = Math.max(0, (repair.partsCost || 0) - costToDeduct);
        await repair.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: "Part removed from repair ticket and warehouse stock restored.",
            repair,
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
};