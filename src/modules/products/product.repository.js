import Product from "./product.model.js";
import Inventory from "../inventory/inventory.model.js";
import Offer from "../offer/offer.model.js";


// Create Product

export const createProductDB = async (data) => {

    return await Product.create(data);

};




// Get All Products (Admin)

export const getProductsDB = async (query = {}) => {

    const products = await Product.find({
        isDeleted: false,
        ...query
    })
    .populate("category", "name slug")
    .populate("brand", "name slug logo")
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });

    const productIds = products.map(p => p._id);

    const inventories = await Inventory.find({
        product: { $in: productIds }
    });

    const inventoryMap = {};

    inventories.forEach(inv => {
        inventoryMap[inv.product.toString()] = inv;
    });

    return products.map(product => ({
        ...product.toObject(),
        inventory: inventoryMap[product._id.toString()] || {
            currentStock: 0,
            reservedStock: 0,
            minimumStock: 0,
            maximumStock: 0
        }
    }));
};




// Get Product By ID

export const getProductByIdDB = async (id)=>{


    return await Product.findOne({

        _id:id,

        isDeleted:false

    })

    .populate(
        "category",
        "name"
    )

    .populate(
        "brand",
        "name logo"
    );


};




// Get Product By SKU

export const getProductBySKUDB = async(sku)=>{


    return await Product.findOne({

        sku,

        isDeleted:false

    });


};




// Get Product By Name

export const getProductByNameDB = async(name)=>{


    return await Product.findOne({

        name,

        isDeleted:false

    });


};




// Update Product

export const updateProductDB = async(
    id,
    data
)=>{


    return await Product.findByIdAndUpdate(

        id,

        data,

        {
            new:true
        }

    );


};




// Soft Delete Product

export const deleteProductDB = async(id)=>{


    return await Product.findByIdAndUpdate(

        id,

        {

            isDeleted:true

        },

        {
            new:true
        }

    );


};




// Search Product

export const searchProductsDB = async(keyword)=>{


    return await Product.find({

        isDeleted:false,


        $or:[

            {
                name:{
                    $regex:keyword,
                    $options:"i"
                }
            },


            {
                sku:{
                    $regex:keyword,
                    $options:"i"
                }
            }

        ]

    })

    .populate(
        "category",
        "name"
    )

    .populate(
        "brand",
        "name"
    );


};

export const getProductByBarcodeDB = async (barcode) => {

    return await Product.findOne({

        barcode,

        isDeleted: false

    });

};


// Customer Shop Products
export const getShopProductsDB = async () => {

    const products = await Product.find({
        status:"ACTIVE",
        isDeleted:false
    })
    .populate("category")
    .populate("brand");


    const activeOffers = await Offer.find({

        status:"ACTIVE",

        startDate:{
            $lte:new Date()
        },

        endDate:{
            $gte:new Date()
        }

    });



    const productsWithOffer = products.map(product => {


        const offer = activeOffers.find(
            offer =>
            offer.products.some(
                id => id.toString() === product._id.toString()
            )
        );


        return {

            ...product.toObject(),

            offer: offer || null

        };


    });



    return productsWithOffer;

};


export const findProductsByReceptionist = async (receptionistId) => {
  return await Product.find({ addedBy: receptionistId }).sort({ createdAt: -1 });
};
