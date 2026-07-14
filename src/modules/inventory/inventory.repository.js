import Inventory from "./inventory.model.js";


// Create Inventory

export const createInventory = async (data) => {

    return await Inventory.create(data);

};



// Get All Inventory

export const getAllInventory = async () => {

    return await Inventory.find({
        isDeleted:false
    })
    .populate(
        "product",
        "name sku images pricing"
    )
    .populate(
        "lastUpdatedBy",
        "name email"
    )
    .sort({
        createdAt:-1
    });

};



// Get Single Inventory

export const getInventoryById = async (id) => {


    return await Inventory.findOne({

        _id:id,

        isDeleted:false

    })
    .populate(
        "product",
        "name sku images pricing"
    )
    .populate(
        "lastUpdatedBy",
        "name email"
    );


};



// Find Inventory By Product

export const getInventoryByProductId = async(productId)=>{


    return await Inventory.findOne({

        product:productId,

        isDeleted:false

    });


};



// Update Inventory

export const updateInventory = async(
    id,
    data
)=>{


    return await Inventory.findByIdAndUpdate(

        id,

        data,

        {
            new:true
        }

    );


};



// Soft Delete Inventory

export const deleteInventory = async(id)=>{


    return await Inventory.findByIdAndUpdate(

        id,

        {
            isDeleted:true
        },

        {
            new:true
        }

    );


};



// Update Stock

export const updateStock = async(
    productId,
    quantity
)=>{


    return await Inventory.findOneAndUpdate(

        {
            product:productId
        },

        {
            $inc:{
                currentStock:quantity
            }
        },

        {
            new:true
        }

    );


};