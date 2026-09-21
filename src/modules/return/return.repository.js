import Return from "./return.model.js";


// ======================================================
// CREATE
// ======================================================

export const createReturnDB = async (data) => {

    return await Return.create(data);

};


// ======================================================
// FIND BY ID
// ======================================================

export const getReturnByIdDB = async (id) => {

    return await Return.findOne({
        _id: id,
        isDeleted: false
    })
        .populate("user", "name email phone")
        .populate("order")
        .populate("items.product", "name sku barcode images")
        .populate("requestedBy", "name email role")
        .populate("approvedBy", "name email role")
        .populate("receivedBy", "name email role")
        .populate("inspectedBy", "name email role")
        .populate("completedBy", "name email role");

};


// ======================================================
// FIND ALL
// ======================================================

export const getReturnsDB = async (filter = {}) => {

    return await Return.find({
        ...filter,
        isDeleted: false
    })
        .populate("user", "name email phone")
        .populate("order", "orderType orderSource finalAmount orderStatus")
        .populate("items.product", "name sku barcode")
        .sort({ createdAt: -1 });

};


// ======================================================
// FIND CUSTOMER RETURNS FOR ORDER
// ======================================================

export const getReturnsByOrderDB = async (
    orderId,
    userId = null
) => {

    const filter = {
        order: orderId,
        isDeleted: false
    };

    if (userId) {
        filter.user = userId;
    }

    return await Return.find(filter)
        .populate("items.product", "name sku barcode")
        .sort({ createdAt: -1 });

};


// ======================================================
// UPDATE
// ======================================================

export const updateReturnDB = async (
    id,
    updateData
) => {

    return await Return.findOneAndUpdate(
        {
            _id: id,
            isDeleted: false
        },
        updateData,
        {
            new: true,
            runValidators: true
        }
    );

};


// ======================================================
// SOFT DELETE
// ======================================================

export const deleteReturnDB = async (id) => {

    return await Return.findOneAndUpdate(
        {
            _id: id,
            isDeleted: false
        },
        {
            isDeleted: true
        },
        {
            new: true
        }
    );

};


export default {
    createReturnDB,
    getReturnByIdDB,
    getReturnsDB,
    getReturnsByOrderDB,
    updateReturnDB,
    deleteReturnDB
};