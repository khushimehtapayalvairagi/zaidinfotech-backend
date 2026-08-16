// import {

// createProductService,
// getProductsService,
// getProductService,
// updateProductService,
// deleteProductService,
// searchProductService,
// getShopProductsService

// } from "./product.service.js";


// import {

// successResponse,
// errorResponse

// } from "../../common/utils/apiResponse.js";


// import { fetchProductsAddedByReceptionist } from './product.service.js';

    
// export const getProductsAddedByReceptionist = async (req, res) => {
//   try {
//     const { receptionistId } = req.params;
//     const products = await fetchProductsAddedByReceptionist(receptionistId);

//     return res.status(200).json({
//       success: true,
//       count: products.length,
//       data: products
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };
// export const getProductsOrderedByReceptionist = async (req, res) => {
//   try {
//     const { receptionistId } = req.params;

//     // Fetching orders created by this receptionist ID
//     const orders = await Order.find({ receptionistId })
//       .populate('items.product')
//       .sort({ createdAt: -1 });

//     return res.status(200).json({
//       success: true,
//       count: orders.length,
//       data: orders
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // =================================
// // Create Product (ADMIN)
// // =================================

// export const createProduct = async (req,res)=>{

// try {


// if(req.files && req.files.length > 0){

// req.body.images = req.files.map((file)=>({

// url:`/uploads/products/${file.filename}`,

// alt:file.originalname

// }));

// }



// if(req.body.specifications){

// req.body.specifications =
// JSON.parse(req.body.specifications);

// }



// req.body.pricing={

// purchasePrice:Number(req.body.purchasePrice || 0),

// sellingPrice:Number(req.body.sellingPrice || 0),

// mrp:Number(req.body.mrp || 0),

// discount:Number(req.body.discount || 0),

// gst:Number(req.body.gst || 0)

// };

// req.body.slug = req.body.name
//     .toLowerCase()
//     .trim()
//     .replace(/\s+/g, "-")
//     .replace(/[^\w-]+/g, "");

// // const product =
// // await createProductService(
// // req.body,
// // req.user.id
// // );

// const product = await createProductService(
//     req.body,
//     req.user.id,
//     req.files || []
// );


// return successResponse(
// res,
// 201,
// "Product created successfully",
// product
// );


// }
// catch(error){

// return errorResponse(
// res,
// 400,
// error.message
// );

// }

// };





// // =================================
// // Get All Products (ADMIN)
// // =================================

// export const getProducts = async(req,res)=>{

//     try{


//         const products =

//         await getProductsService();



//         return successResponse(

//             res,

//             200,

//             "Products fetched successfully",

//             products

//         );


//     }
//     catch(error){


//         return errorResponse(

//             res,

//             500,

//             error.message

//         );


//     }

// };






// // =================================
// // Get Product By ID
// // =================================

// export const getProductById = async(req,res)=>{

//     try{


//         const product =

//         await getProductService(

//             req.params.id

//         );



//         return successResponse(

//             res,

//             200,

//             "Product fetched successfully",

//             product

//         );


//     }
//     catch(error){


//         return errorResponse(

//             res,

//             404,

//             error.message

//         );


//     }

// };








// // =================================
// // Update Product
// // =================================

// export const updateProduct = async(req,res)=>{

//     try{


//         const product =

//         await updateProductService(

//             req.params.id,

//             req.body

//         );



//         return successResponse(

//             res,

//             200,

//             "Product updated successfully",

//             product

//         );


//     }
//     catch(error){


//         return errorResponse(

//             res,

//             400,

//             error.message

//         );


//     }

// };








// // =================================
// // Delete Product
// // =================================

// export const deleteProduct = async(req,res)=>{

//     try{


//         await deleteProductService(

//             req.params.id

//         );



//         return successResponse(

//             res,

//             200,

//             "Product deleted successfully"

//         );


//     }
//     catch(error){


//         return errorResponse(

//             res,

//             500,

//             error.message

//         );


//     }

// };








// // =================================
// // Search Product
// // =================================

// export const searchProduct = async(req,res)=>{

//     try{


//         const result =

//         await searchProductService(

//             req.query.keyword

//         );



//         return successResponse(

//             res,

//             200,

//             "Search result",

//             result

//         );


//     }
//     catch(error){


//         return errorResponse(

//             res,

//             500,

//             error.message

//         );


//     }

// };








// // =================================
// // Customer Shop Products
// // =================================

// export const getShopProducts = async(req,res)=>{

//     try{


//         const products =

//         await getShopProductsService();



//         return successResponse(

//             res,

//             200,

//             "Shop products fetched successfully",

//             products

//         );


//     }
//     catch(error){


//         return errorResponse(

//             res,

//             500,

//             error.message

//         );


//     }

// };



import {
    createProductService,
    getProductsService,
    getProductService,
    updateProductService,
    deleteProductService,
    searchProductService,
    getShopProductsService,
    fetchProductsAddedByReceptionist
} from "./product.service.js";

import {
    successResponse,
    errorResponse
} from "../../common/utils/apiResponse.js";


// =====================================================
// PARSE MULTIPART JSON FIELDS
// =====================================================
//
// multer ke baad FormData ke saare normal fields string
// hote hain.
//
// Example:
//
// req.body.pricing
//
// becomes:
//
// '{"purchasePrice":50000,"sellingPrice":70000,...}'
//
// Joi ko object chahiye.
//
// Is middleware mein string ko object mein convert
// karte hain BEFORE Joi validation.
// =====================================================

export const parseProductMultipartData = (
    req,
    res,
    next
) => {

    try {

        // =================================================
        // PRICING
        // =================================================

        if (
            typeof req.body.pricing === "string"
        ) {

            if (
                req.body.pricing.trim() === ""
            ) {

                req.body.pricing = {};

            } else {

                try {

                    req.body.pricing =
                        JSON.parse(
                            req.body.pricing
                        );

                } catch (error) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Invalid pricing JSON",

                        errors: [
                            "pricing must contain valid JSON"
                        ]

                    });

                }

            }

        }


        // =================================================
        // SPECIFICATIONS
        // =================================================

        if (
            typeof req.body.specifications === "string"
        ) {

            if (
                req.body.specifications.trim() === ""
            ) {

                req.body.specifications = {};

            } else {

                try {

                    req.body.specifications =
                        JSON.parse(
                            req.body.specifications
                        );

                } catch (error) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Invalid specifications JSON",

                        errors: [
                            "specifications must contain valid JSON"
                        ]

                    });

                }

            }

        }


        // =================================================
        // NEXT
        // =================================================

        next();

    } catch (error) {

        console.error(
            "PRODUCT MULTIPART PARSER ERROR:",
            error
        );

        return res.status(400).json({

            success: false,

            message:
                "Invalid product data",

            errors: [
                error.message
            ]

        });

    }

};


// =====================================================
// PRODUCTS ADDED BY RECEPTIONIST
// =====================================================

export const getProductsAddedByReceptionist = async (
    req,
    res
) => {

    try {

        const {
            receptionistId
        } = req.params;


        const products =
            await fetchProductsAddedByReceptionist(
                receptionistId
            );


        return res.status(200).json({

            success: true,

            count:
                products.length,

            data:
                products

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

};


// =====================================================
// PRODUCTS ORDERED BY RECEPTIONIST
// =====================================================

export const getProductsOrderedByReceptionist = async (
    req,
    res
) => {

    try {

        const {
            receptionistId
        } = req.params;


        // IMPORTANT:
        // Keep your existing Order import/model here
        // if this controller already has it in your file.
        //
        // Example:
        // import Order from "../orders/order.model.js";

        const orders =
            await Order.find({
                receptionistId
            })
                .populate("items.product")
                .sort({
                    createdAt: -1
                });


        return res.status(200).json({

            success: true,

            count:
                orders.length,

            data:
                orders

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

};


// =====================================================
// CREATE PRODUCT
// ADMIN
// =====================================================

export const createProduct = async (
    req,
    res
) => {

    try {

        console.log(
            "======================================"
        );

        console.log(
            "CREATE PRODUCT CONTROLLER"
        );

        console.log(
            "======================================"
        );

        console.log(
            "BODY BEFORE SERVICE:",
            req.body
        );

        console.log(
            "FILES:",
            req.files
        );


        // =================================================
        // IMPORTANT
        // =================================================
        //
        // DO NOT recreate req.body.pricing here.
        //
        // parseProductMultipartData has already converted:
        //
        // pricing string
        //
        // into:
        //
        // pricing object
        //
        // So Joi validation has already passed before
        // controller reaches here.
        // =================================================


        // =================================================
        // CREATE PRODUCT
        // =================================================

        const product =
            await createProductService(

                req.body,

                req.user.id,

                req.files || []

            );


        // =================================================
        // SUCCESS
        // =================================================

        return successResponse(

            res,

            201,

            "Product created successfully",

            product

        );

    } catch (error) {

        console.error(
            "CREATE PRODUCT CONTROLLER ERROR:",
            error
        );


        return errorResponse(

            res,

            400,

            error.message

        );

    }

};


// =====================================================
// GET ALL PRODUCTS
// =====================================================

export const getProducts = async (
    req,
    res
) => {

    try {

        const products =
            await getProductsService();


        return successResponse(

            res,

            200,

            "Products fetched successfully",

            products

        );

    } catch (error) {

        return errorResponse(

            res,

            500,

            error.message

        );

    }

};


// =====================================================
// GET PRODUCT BY ID
// =====================================================

export const getProductById = async (
    req,
    res
) => {

    try {

        const product =
            await getProductService(
                req.params.id
            );


        return successResponse(

            res,

            200,

            "Product fetched successfully",

            product

        );

    } catch (error) {

        return errorResponse(

            res,

            404,

            error.message

        );

    }

};


// =====================================================
// UPDATE PRODUCT
// =====================================================

export const updateProduct = async (
    req,
    res
) => {

    try {

        // =================================================
        // If update request comes as multipart/form-data,
        // parse pricing/specifications as well.
        // =================================================

        if (
            typeof req.body.pricing === "string"
        ) {

            req.body.pricing =
                JSON.parse(
                    req.body.pricing
                );

        }


        if (
            typeof req.body.specifications === "string"
        ) {

            req.body.specifications =
                JSON.parse(
                    req.body.specifications
                );

        }


        const product =
            await updateProductService(

                req.params.id,

                req.body

            );


        return successResponse(

            res,

            200,

            "Product updated successfully",

            product

        );

    } catch (error) {

        console.error(
            "UPDATE PRODUCT ERROR:",
            error
        );


        return errorResponse(

            res,

            400,

            error.message

        );

    }

};


// =====================================================
// DELETE PRODUCT
// =====================================================

export const deleteProduct = async (
    req,
    res
) => {

    try {

        await deleteProductService(
            req.params.id
        );


        return successResponse(

            res,

            200,

            "Product deleted successfully"

        );

    } catch (error) {

        return errorResponse(

            res,

            500,

            error.message

        );

    }

};


// =====================================================
// SEARCH PRODUCT
// =====================================================

export const searchProduct = async (
    req,
    res
) => {

    try {

        const result =
            await searchProductService(
                req.query.keyword
            );


        return successResponse(

            res,

            200,

            "Search result",

            result

        );

    } catch (error) {

        return errorResponse(

            res,

            500,

            error.message

        );

    }

};


// =====================================================
// CUSTOMER SHOP PRODUCTS
// =====================================================

// export const getShopProducts = async (
//     req,
//     res
// ) => {

//     try {

//         const products =
//             await getShopProductsService();


//         return successResponse(

//             res,

//             200,

//             "Shop products fetched successfully",

//             products

//         );

//     } catch (error) {

//         return errorResponse(

//             res,

//             500,

//             error.message

//         );

//     }

// };

// =====================================================
// CUSTOMER SHOP PRODUCTS
// =====================================================

export const getShopProducts = async (
    req,
    res
) => {

    try {

        console.log(
            "======================================"
        );

        console.log(
            "CUSTOMER SHOP PRODUCTS REQUEST"
        );

        console.log(
            "======================================"
        );


        const products =
            await getShopProductsService();


        console.log(
            "SHOP CONTROLLER PRODUCTS:",
            products.length
        );


        return successResponse(

            res,

            200,

            "Shop products fetched successfully",

            products

        );

    } catch (error) {

        console.error(
            "======================================"
        );

        console.error(
            "GET SHOP PRODUCTS CONTROLLER ERROR:"
        );

        console.error(
            error
        );

        console.error(
            "======================================"
        );


        return errorResponse(

            res,

            500,

            error.message

        );

    }

};