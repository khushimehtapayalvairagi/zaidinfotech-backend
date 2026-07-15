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
import Inventory from "../inventory/inventory.model.js";

import generateSlug from "../../common/utils/generateSlug.js";
import generateSKU from "../../common/utils/generateSKU.js";
import {
   
    getProductByBarcodeDB
} from "./product.repository.js";

/*
=========================================
Create Product
=========================================
*/

export const createProductService = async (
    data,
    userId,
    files = []
) => {

    // =========================
    // Duplicate Product
    // =========================

    const existingProduct =
        await getProductByNameDB(data.name);

    if (existingProduct) {
        throw new Error("Product already exists");
    }

    // =========================
    // Duplicate Barcode
    // =========================

    if (data.barcode) {

      const barcodeExists =
await getProductByBarcodeDB(data.barcode);

        if (barcodeExists) {
            throw new Error("Barcode already exists");
        }

    }

    // =========================
    // Category Validation
    // =========================

    const category =
        await Category.findById(data.category);

    if (!category) {
        throw new Error("Category not found");
    }

    // =========================
    // Brand Validation
    // =========================

    const brand =
        await Brand.findById(data.brand);

    if (!brand) {
        throw new Error("Brand not found");
    }

    // =========================
    // Slug
    // =========================

    data.slug = generateSlug(data.name);

    // =========================
    // SKU
    // =========================

    const products =
        await getProductsDB();

    data.sku = generateSKU(
        category.name,
        brand.name,
        products.length + 1
    );

    // =========================
    // Images
    // =========================

    if (files.length > 0) {

        data.images = files.map(file => ({

            url: file.path,

            alt: data.name

        }));

    }

    // =========================
    // Created By
    // =========================

    data.createdBy = userId;

    // =========================
    // Save Product
    // =========================

    const product =
        await createProductDB(data);

    // =========================
    // Auto Inventory Create
    // =========================

    await Inventory.create({

        product: product._id,

        currentStock: 0,

        reservedStock: 0,

        minimumStock: 0,

        maximumStock: 0,

        warehouseLocation: "",

        createdBy: userId

    });

    return product;

};

/*
=========================================
Get Products
=========================================
*/

export const getProductsService = async () => {

    return await getProductsDB();

};

/*
=========================================
Get Product
=========================================
*/

export const getProductService = async (id) => {

    const product =
        await getProductByIdDB(id);

    if (!product) {

        throw new Error("Product not found");

    }

    return product;

};

/*
=========================================
Update Product
=========================================
*/

export const updateProductService = async (
    id,
    data
) => {

    if (data.name) {

        data.slug =
            generateSlug(data.name);

    }

    const product =
        await updateProductDB(id, data);

    if (!product) {

        throw new Error("Product not found");

    }

    return product;

};

/*
=========================================
Delete Product
=========================================
*/

export const deleteProductService = async (id) => {

    const product =
        await deleteProductDB(id);

    if (!product) {

        throw new Error("Product not found");

    }

    return product;

};

/*
=========================================
Search Product
=========================================
*/

export const searchProductService = async (
    keyword
) => {

    return await searchProductsDB(keyword);

};

/*
=========================================
Customer Shop Products
=========================================
*/

export const getShopProductsService = async () => {

    return await getShopProductsDB();

};