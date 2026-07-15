import Product from "./product.model.js";
import Inventory from "../inventory/inventory.model.js";


// Create Product

export const createProductDB = async (data) => {

    return await Product.create(data);

};




// Get All Products (Admin)

export const getProductsDB = async (query = {}) => {


    return await Product.find({

        isDeleted:false,

        ...query

    })

    .populate(
        "category",
        "name slug"
    )

    .populate(
        "brand",
        "name slug logo"
    )

    .populate(
        "createdBy",
        "name email"
    )

    .sort({
        createdAt:-1
    });


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

export const getShopProductsDB = async()=>{


const products =
await Product.find({

    isDeleted:false,

    status:"ACTIVE"

})

.populate(
    "category",
    "name slug"
)

.populate(
    "brand",
    "name"
)

.lean();




const result =
await Promise.all(

products.map(async(product)=>{


const inventory =
await Inventory.findOne({

product:product._id,

isDeleted:false

})
.lean();



return {


_id:product._id,


name:product.name,


slug:product.slug,


images:product.images,



pricing:{

sellingPrice:
product.pricing.sellingPrice,

mrp:
product.pricing.mrp,

discount:
product.pricing.discount

},



category:
product.category,


brand:
product.brand,




// Inventory Data

availability:

inventory && 
inventory.currentStock -
inventory.reservedStock > 0

?

"IN_STOCK"

:

"OUT_OF_STOCK"



};


})

);



return result;


};