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




// =================================
// Create Product (ADMIN)
// =================================

export const createProduct = async (req,res)=>{

try {


if(req.files && req.files.length > 0){

req.body.images = req.files.map((file)=>({

url:`/uploads/products/${file.filename}`,

alt:file.originalname

}));

}



if(req.body.specifications){

req.body.specifications =
JSON.parse(req.body.specifications);

}



req.body.pricing={

purchasePrice:Number(req.body.purchasePrice || 0),

sellingPrice:Number(req.body.sellingPrice || 0),

mrp:Number(req.body.mrp || 0),

discount:Number(req.body.discount || 0),

gst:Number(req.body.gst || 0)

};



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





// =================================
// Get All Products (ADMIN)
// =================================

export const getProducts = async(req,res)=>{

    try{


        const products =

        await getProductsService();



        return successResponse(

            res,

            200,

            "Products fetched successfully",

            products

        );


    }
    catch(error){


        return errorResponse(

            res,

            500,

            error.message

        );


    }

};






// =================================
// Get Product By ID
// =================================

export const getProductById = async(req,res)=>{

    try{


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


    }
    catch(error){


        return errorResponse(

            res,

            404,

            error.message

        );


    }

};








// =================================
// Update Product
// =================================

export const updateProduct = async(req,res)=>{

    try{


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


    }
    catch(error){


        return errorResponse(

            res,

            400,

            error.message

        );


    }

};








// =================================
// Delete Product
// =================================

export const deleteProduct = async(req,res)=>{

    try{


        await deleteProductService(

            req.params.id

        );



        return successResponse(

            res,

            200,

            "Product deleted successfully"

        );


    }
    catch(error){


        return errorResponse(

            res,

            500,

            error.message

        );


    }

};








// =================================
// Search Product
// =================================

export const searchProduct = async(req,res)=>{

    try{


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


    }
    catch(error){


        return errorResponse(

            res,

            500,

            error.message

        );


    }

};








// =================================
// Customer Shop Products
// =================================

export const getShopProducts = async(req,res)=>{

    try{


        const products =

        await getShopProductsService();



        return successResponse(

            res,

            200,

            "Shop products fetched successfully",

            products

        );


    }
    catch(error){


        return errorResponse(

            res,

            500,

            error.message

        );


    }

};