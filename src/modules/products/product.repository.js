import Product from "./product.model.js";


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




// Customer Shop Products

export const getShopProductsDB = async()=>{


    return await Product.find({

        isDeleted:false,

        status:"ACTIVE"

    })

    .select({

        name:1,

        slug:1,

        images:1,

        pricing:1,

        brand:1,

        category:1

    })

    .populate(
        "brand",
        "name logo"
    )

    .populate(
        "category",
        "name"
    );


};