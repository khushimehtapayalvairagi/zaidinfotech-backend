import {

createProductService,
getProductsService,
getProductService,
updateProductService,
deleteProductService,
searchProductService,
getShopProductsService

} from "./product.service.js";

import {
successResponse,
errorResponse
} from "../../common/utils/apiResponse.js";


// ============================
// Create Product (ADMIN)
// ============================

export const createProduct = async(req,res)=>{

    try{


        const product =
        await createProductService(
            req.body,
            req.user.id
        );


return successResponse(
    res,
    201,
    "Product created successfully",
    product
);



    }
    catch(error){

      return errorResponse(
    res,
    400,
    error.message
);
    }

};







// ============================
// Get All Products (ADMIN)
// ============================

export const getProducts = async(req,res)=>{

    try{


        const products =
        await getProductsService();



        res.status(200).json({

            success:true,

            data:products

        });



    }
    catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};








// ============================
// Get Product By ID
// ============================

export const getProductById = async(req,res)=>{


    try{


        const product =
        await getProductService(
            req.params.id
        );



        res.status(200).json({

            success:true,

            data:product

        });



    }
    catch(error){


        res.status(404).json({

            success:false,

            message:error.message

        });


    }


};








// ============================
// Update Product (ADMIN)
// ============================

export const updateProduct = async(req,res)=>{


    try{


        const product =
        await updateProductService(

            req.params.id,

            req.body

        );



        res.status(200).json({

            success:true,

            message:
            "Product updated successfully",

            data:product

        });



    }
    catch(error){


        res.status(400).json({

            success:false,

            message:error.message

        });


    }


};








// ============================
// Delete Product (ADMIN)
// ============================

export const deleteProduct = async(req,res)=>{


    try{


        await deleteProductService(

            req.params.id

        );



        res.status(200).json({

            success:true,

            message:
            "Product deleted successfully"

        });



    }
    catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }

};









// ============================
// Search Product
// ============================

export const searchProduct = async(req,res)=>{


    try{


        const result =
        await searchProductService(

            req.query.keyword

        );



        res.status(200).json({

            success:true,

            data:result

        });



    }
    catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


};









// ============================
// Customer Shop Products
// ============================

export const getShopProducts = async(req,res)=>{


    try{


        const products =
        await getShopProductsService();



        res.status(200).json({

            success:true,

            data:products

        });



    }
    catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


};