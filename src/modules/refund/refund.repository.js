import Refund from "./refund.model.js";


// =====================================================
// CREATE REFUND
// =====================================================

export const createRefundDB = async (data) => {

    return await Refund.create(data);

};


// =====================================================
// GET REFUND BY ID
// =====================================================

export const getRefundByIdDB = async (id) => {

    return await Refund.findById(id)

        .populate("order")

        .populate("user", "name email phone")

        .populate("payment")

        .populate("items.product")

        .populate("requestedBy", "name email")

        .populate("approvedBy", "name email")

        .populate("processedBy", "name email");

};


// =====================================================
// GET REFUNDS BY ORDER
// =====================================================

export const getRefundsByOrderDB = async (orderId) => {

    return await Refund.find({
        order: orderId
    })

        .populate("user", "name email phone")

        .populate("payment")

        .populate("items.product")

        .sort({
            createdAt: -1
        });

};


// =====================================================
// GET ALL REFUNDS
// =====================================================

export const getAllRefundsDB = async (query = {}) => {

    return await Refund.find(query)

        .populate("order")

        .populate("user", "name email phone")

        .populate("payment")

        .populate("items.product")

        .populate("requestedBy", "name email")

        .populate("approvedBy", "name email")

        .populate("processedBy", "name email")

        .sort({
            createdAt: -1
        });

};


// =====================================================
// UPDATE REFUND
// =====================================================

export const updateRefundDB = async (
    id,
    data
) => {

    return await Refund.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true
        }
    );

};