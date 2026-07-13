import {
    createProductDB,
    getProductsDB,
    getProductByIdDB,
    getProductByNameDB,
    getProductBySKUDB,
    updateProductDB,
    deleteProductDB,
    searchProductsDB,
    getShopProductsDB
} from "./product.repository.js";


import Category from "../categories/category.model.js";

import Brand from "../brands/brand.model.js";


import generateSlug from "../../common/utils/generateSlug.js";

import generateSKU from "../../common/utils/generateSKU.js";



/*
 Create Product
*/

export const createProductService = async(
    data,
    userId
)=>{


    // Duplicate Product Check

    const existingProduct =
    await getProductByNameDB(data.name);



    if(existingProduct){

        throw new Error(
            "Product already exists"
        );

    }



    // Category Check

    const category =
    await Category.findById(
        data.category
    );



    if(!category){

        throw new Error(
            "Category not found"
        );

    }



    // Brand Check

    const brand =
    await Brand.findById(
        data.brand
    );



    if(!brand){

        throw new Error(
            "Brand not found"
        );

    }



    // Generate Slug

    data.slug =
    generateSlug(
        data.name
    );




    // Count Products for SKU

    const productCount =
    await getProductsDB();



    const skuNumber =
    productCount.length + 1;



    // Generate SKU

    data.sku =
    generateSKU(

        category.name,

        brand.name,

        skuNumber

    );



    // Created By

    data.createdBy =
    userId;



    return await createProductDB(
        data
    );


};





/*
 Get All Products
*/


export const getProductsService =
async()=>{


    return await getProductsDB();


};





/*
 Get Product By ID
*/


export const getProductService =
async(id)=>{


    const product =
    await getProductByIdDB(id);



    if(!product){

        throw new Error(
            "Product not found"
        );

    }


    return product;


};





/*
 Update Product
*/


export const updateProductService =
async(
    id,
    data
)=>{


    if(data.name){

        data.slug =
        generateSlug(
            data.name
        );

    }



    return await updateProductDB(
        id,
        data
    );


};





/*
 Delete Product
*/


export const deleteProductService =
async(id)=>{


    return await deleteProductDB(
        id
    );


};





/*
 Search Product
*/


export const searchProductService =
async(keyword)=>{


    return await searchProductsDB(
        keyword
    );


};





/*
 Customer Shop Products
*/


export const getShopProductsService =
async()=>{


    return await getShopProductsDB();


};