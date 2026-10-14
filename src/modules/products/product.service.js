import {
    createProductDB,
    getProductsDB,
    getProductByIdDB,
    getProductByNameDB,
    updateProductDB,
    deleteProductDB,
    searchProductsDB,
    getShopProductsDB,
    getProductByBarcodeDB,
    findProductsByReceptionist
} from "./product.repository.js";

import Category from "../categories/category.model.js";

import Brand from "../brands/brand.model.js";

import RentalProduct from "../rental/rentalProduct.model.js";

import Inventory from "../inventory/inventory.model.js";

import generateSlug from "../../common/utils/generateSlug.js";

import generateSKU from "../../common/utils/generateSKU.js";

import {
    calculateDiscountedPrice,
    matchOfferToProduct
} from "../../common/utils/offerCalculator.js";

import {
    getActiveOffersDB
} from "../offer/offer.repository.js";


// =====================================================
// CUSTOMER PRICE HELPER
// =====================================================
//
// PERSONAL  -> retailPrice
// BUSINESS  -> wholesalePrice
//
// =====================================================
const getCustomerPrice = (
    product,
    customerType = "PERSONAL"
) => {

    if (customerType === "BUSINESS") {

        return (
            product.pricing?.wholesalePrice
            ??
            product.pricing?.retailPrice
            ??
            0
        );

    }

    return (
        product.pricing?.retailPrice
        ?? 0
    );

};


// =====================================================
// SAFE CUSTOMER PRICING
// =====================================================
//
// IMPORTANT:
// PERSONAL customer ko wholesalePrice
// response mein nahi bhejna.
//
// BUSINESS customer ko wholesalePrice
// sellingPrice ke naam se milega.
//
// =====================================================

const getSafePricing = (
    product,
    customerType
) => {

    const customerPrice =
        getCustomerPrice(
            product,
            customerType
        );

    return {

        mrp:
            product.pricing?.mrp
            ?? 0,

        discount:
            product.pricing?.discount
            ?? 0,

        gst:
            product.pricing?.gst
            ?? 0,

        sellingPrice:
            customerPrice

    };

};


// =====================================================
// PRODUCTS ADDED BY RECEPTIONIST
// =====================================================

export const fetchProductsAddedByReceptionist = async (
    receptionistId
) => {

    const products =
        await findProductsByReceptionist(
            receptionistId
        );

    return products;

};


// =====================================================
// CREATE PRODUCT
// =====================================================

export const createProductService = async (
    data,
    userId,
    files = []
) => {

    try {

        console.log(
            "========== CREATE PRODUCT SERVICE =========="
        );

        console.log(
            "Incoming Product Data:",
            data
        );

        console.log(
            "Files:",
            files
        );


        // =================================================
        // DUPLICATE PRODUCT
        // =================================================

        const existingProduct =
            await getProductByNameDB(
                data.name
            );

        if (existingProduct) {

            throw new Error(
                "Product already exists"
            );

        }


        // =================================================
        // DUPLICATE BARCODE
        // =================================================

        if (data.barcode) {

            const barcodeExists =
                await getProductByBarcodeDB(
                    data.barcode
                );

            if (barcodeExists) {

                throw new Error(
                    "Barcode already exists"
                );

            }

        }


        // =================================================
        // CATEGORY VALIDATION
        // =================================================

        const category =
            await Category.findById(
                data.category
            );

        if (!category) {

            throw new Error(
                "Category not found"
            );

        }

        console.log(
            "PARENT CATEGORY:",
            category._id,
            category.name
        );


        // =================================================
        // SUBCATEGORY VALIDATION
        // =================================================

        let subcategory = null;

        if (data.subcategory) {

            subcategory =
                await Category.findById(
                    data.subcategory
                );

            if (!subcategory) {

                throw new Error(
                    "Subcategory not found"
                );

            }

            console.log(
                "SUBCATEGORY:",
                subcategory._id,
                subcategory.name
            );

        }


        // =================================================
        // BRAND VALIDATION
        // =================================================

        const brand =
            await Brand.findById(
                data.brand
            );

        if (!brand) {

            throw new Error(
                "Brand not found"
            );

        }


        // =================================================
        // PRICING
        // =================================================

        const pricing = {

            purchasePrice:
                Number(
                    data.pricing?.purchasePrice
                    ?? 0
                ),

            retailPrice:
                Number(
                    data.pricing?.retailPrice
                    ?? 0
                ),

            wholesalePrice:
                data.pricing?.wholesalePrice !== null &&
                data.pricing?.wholesalePrice !== undefined &&
                data.pricing?.wholesalePrice !== ""
                    ? Number(
                        data.pricing.wholesalePrice
                    )
                    : null,

            mrp:
                Number(
                    data.pricing?.mrp
                    ?? 0
                ),

            discount:
                Number(
                    data.pricing?.discount
                    ?? 0
                ),

            gst:
                Number(
                    data.pricing?.gst
                    ?? 0
                )

        };


        // =================================================
        // SLUG
        // =================================================

        const slug =
            generateSlug(
                data.name
            );


        // =================================================
        // SKU
        // =================================================

        const products =
            await getProductsDB();

        const sku =
            generateSKU(
                category.name,
                brand.name,
                products.length + 1
            );


        // =================================================
        // IMAGES
        // =================================================

        let images = [];

        if (
            files &&
            files.length > 0
        ) {

            images =
                files.map(
                    (file) => ({

                        url:
                            `/uploads/products/${file.filename}`,

                        alt:
                            data.name

                    })
                );

        }


        // =================================================
        // FINAL PRODUCT DATA
        // =================================================

        const productData = {

            name:
                data.name,


            // =============================================
            // HSN CODE
            //
            // productData is built field by field, so
            // without this the hsnCode sent from the
            // AddProduct form would be silently dropped.
            // It is later copied into invoice items by
            // createInvoiceFromOrder (invoice.service.js).
            // Falls back to "" when not provided.
            // =============================================

            hsnCode:
                data.hsnCode
                    ? String(data.hsnCode).trim()
                    : "",


            category:
                data.category,

            subcategory:
                data.subcategory
                || null,

            productType:
                data.productType
                || "NEW",

            brand:
                data.brand,

            shortDescription:
                data.shortDescription
                || "",

            description:
                data.description
                || "",

            pricing,

            slug,

            sku,

            images,

            rental: {

                isAvailableForRent:
                    data.rental?.isAvailableForRent
                    === true

            },

            createdBy:
                userId

        };


        // =================================================
        // REFURBISHED DETAILS
        // =================================================

        if (
            data.productType
            === "REFURBISHED"
        ) {

            productData.refurbishedDetails = {

                grade:
                    data.refurbishedDetails?.grade
                    || null,

                batteryHealth:
                    Number(
                        data.refurbishedDetails
                            ?.batteryHealth
                        ?? 0
                    ),

                warrantyMonths:
                    Number(
                        data.refurbishedDetails
                            ?.warrantyMonths
                        ?? 0
                    ),

                testingStatus:
                    data.refurbishedDetails
                        ?.testingStatus
                    || null

            };

        }


        // =================================================
        // BARCODE
        // =================================================

        if (data.barcode) {

            productData.barcode =
                data.barcode;

        }


        // =================================================
        // SPECIFICATIONS
        // =================================================

        if (data.specifications) {

            productData.specifications =
                data.specifications;

        }


        // =================================================
        // SEO
        // =================================================

        if (data.metaTitle) {

            productData.metaTitle =
                data.metaTitle;

        }

        if (data.metaDescription) {

            productData.metaDescription =
                data.metaDescription;

        }


        // =================================================
        // STATUS
        // =================================================

        if (data.status) {

            productData.status =
                data.status;

        }


        // =================================================
        // DEBUG
        // =================================================

        console.log(
            "FINAL PRODUCT DATA:",
            productData
        );


        // =================================================
        // CREATE PRODUCT
        // =================================================

        const product =
            await createProductDB(
                productData
            );


        // =====================================================
        // CREATE RENTAL PRODUCT
        // =====================================================
        //
        // Rental is controlled only by:
        //
        // data.rental.isAvailableForRent
        //
        // NOT by productType.
        //
        // =====================================================

        if (
            data.rental?.isAvailableForRent
            === true
        ) {

            const rentalAvailableQuantity =
                Number(
                    data.rental
                        ?.availableQuantity
                    ?? 0
                );

            const rentalData = {

                productId:
                    product._id,

                isAvailableForRent:
                    true,

                monthlyRent:
                    Number(
                        data.rental
                            ?.monthlyRent
                        ?? 0
                    ),

                securityDeposit:
                    Number(
                        data.rental
                            ?.securityDeposit
                        ?? 0
                    ),

                minimumRentalMonths:
                    Math.max(

                        Number(
                            data.rental
                                ?.minimumRentalMonths
                            ?? 3
                        ),

                        3

                    ),

                gst:
                    Number(
                        data.rental
                            ?.gst
                        ?? 0
                    ),

                totalQuantity:
                    rentalAvailableQuantity,

                availableQuantity:
                    rentalAvailableQuantity,

                rentedQuantity:
                    0,

                basicSoftwareInstalled:
                    data.rental
                        ?.basicSoftwareInstalled
                    ?? true,

                includedItems:
                    data.rental
                        ?.includedItems
                        ?.length

                        ? data.rental
                            .includedItems

                        : [

                            "LAPTOP",

                            "CHARGING_ADAPTER",

                            "BACKPACK"

                        ],

                status:
                    "ACTIVE",

                notes:
                    data.rental
                        ?.notes
                    ?? "",

                createdBy:
                    userId

            };

            await RentalProduct.create(
                rentalData
            );

        }


        // =================================================
        // AUTO CREATE INVENTORY
        // =================================================

        await Inventory.create({

            product:
                product._id,

            currentStock:
                0,

            reservedStock:
                0,

            minimumStock:
                0,

            maximumStock:
                0,

            warehouseLocation:
                "",

            createdBy:
                userId

        });


        // =================================================
        // RETURN
        // =================================================

        return product;


    } catch (error) {

        console.error(
            "CREATE PRODUCT SERVICE ERROR:",
            error
        );

        throw error;

    }

};


// =====================================================
// GET PRODUCTS - ADMIN
// =====================================================

export const getProductsService = async () => {

    return await getProductsDB();

};


// =====================================================
// GET SINGLE PRODUCT
// =====================================================

export const getProductService = async (
    id,
    customerType = "PERSONAL"
) => {

    const product =
        await getProductByIdDB(
            id
        );

    if (!product) {

        throw new Error(
            "Product not found"
        );

    }


    // =================================================
    // GET ACTIVE OFFERS
    // =================================================

    const activeOffers =
        await getActiveOffersDB();


    // =================================================
    // MATCH OFFER
    // =================================================

    const offer =
        matchOfferToProduct(
            product,
            activeOffers
        );


    // =================================================
    // CUSTOMER PRICE
    // =================================================

    const customerPrice =
        getCustomerPrice(
            product,
            customerType
        );


    // =================================================
    // FINAL PRICE
    // =================================================

    const finalPrice =
        customerPrice !== null

            ? calculateDiscountedPrice(
                customerPrice,
                offer
            )

            : null;


    // =================================================
    // PRODUCT DATA
    // =================================================

    const productData =
        product.toObject();


    // =================================================
    // SAFE PRICING
    // =================================================

    const safePricing =
        getSafePricing(
            productData,
            customerType
        );


    // =================================================
    // RETURN
    // =================================================

    return {

        ...productData,

        pricing:
            safePricing,

        customerType,

        customerPrice,

        offer:
            offer
            || null,

        finalPrice

    };

};


// =====================================================
// UPDATE PRODUCT
// =====================================================
//
// - Flat pricing fields (retailPrice, mrp etc.) supported
// - Only provided pricing fields are updated
// - refurbishedDetails merged with existing values
// - Rental details synced to RentalProduct collection
// - hsnCode is trimmed and saved (validation in
//   product.validation.js must allow it)
//
// =====================================================

export const updateProductService = async (
    id,
    data
) => {

    // ==========================================
    // FIND EXISTING PRODUCT
    // ==========================================

    const existingProduct =
        await getProductByIdDB(id);

    if (!existingProduct) {
        throw new Error("Product not found");
    }

    const updateData = { ...data };


    // ==========================================
    // HSN CODE
    // ==========================================

    if (updateData.hsnCode !== undefined) {
        updateData.hsnCode =
            updateData.hsnCode === null
                ? ""
                : String(updateData.hsnCode).trim();
    }


    // ==========================================
    // FLAT PRICING SUPPORT
    // ==========================================

    const flatFields = [
        "purchasePrice",
        "retailPrice",
        "wholesalePrice",
        "sellingPrice",
        "mrp",
        "discount",
        "gst"
    ];

    const hasFlatPricing = flatFields.some(
        (field) => updateData[field] !== undefined
    );

    if (hasFlatPricing) {

        const flatPricing = {};

        if (updateData.purchasePrice !== undefined) {
            flatPricing.purchasePrice =
                Number(updateData.purchasePrice);
        }

        if (updateData.retailPrice !== undefined) {
            flatPricing.retailPrice =
                Number(updateData.retailPrice);
        } else if (updateData.sellingPrice !== undefined) {
            flatPricing.retailPrice =
                Number(updateData.sellingPrice);
        }

        if (updateData.wholesalePrice !== undefined) {
            flatPricing.wholesalePrice =
                updateData.wholesalePrice === null ||
                updateData.wholesalePrice === ""
                    ? null
                    : Number(updateData.wholesalePrice);
        }

        if (updateData.mrp !== undefined) {
            flatPricing.mrp = Number(updateData.mrp);
        }

        if (updateData.discount !== undefined) {
            flatPricing.discount = Number(updateData.discount);
        }

        if (updateData.gst !== undefined) {
            flatPricing.gst = Number(updateData.gst);
        }

        updateData.pricing = {
            ...(updateData.pricing || {}),
            ...flatPricing
        };

        flatFields.forEach((field) => {
            delete updateData[field];
        });

    }


    // ==========================================
    // PRICING - UPDATE ONLY PROVIDED FIELDS
    // ==========================================

    if (updateData.pricing) {

        const currentPricing =
            existingProduct.pricing?.toObject?.() ||
            existingProduct.pricing ||
            {};

        const mergedPricing = {
            ...currentPricing,
            ...updateData.pricing
        };

        // Make sure numeric fields are real numbers
        // (nested pricing may arrive as strings from forms)
        [
            "purchasePrice",
            "retailPrice",
            "mrp",
            "discount",
            "gst"
        ].forEach((field) => {
            if (
                mergedPricing[field] !== undefined &&
                mergedPricing[field] !== null &&
                mergedPricing[field] !== ""
            ) {
                mergedPricing[field] =
                    Number(mergedPricing[field]);
            }
        });

        if (
            mergedPricing.wholesalePrice === "" ||
            mergedPricing.wholesalePrice === null
        ) {
            mergedPricing.wholesalePrice = null;
        } else if (mergedPricing.wholesalePrice !== undefined) {
            mergedPricing.wholesalePrice =
                Number(mergedPricing.wholesalePrice);
        }

        updateData.pricing = mergedPricing;

    }


    // ==========================================
    // REFURBISHED DETAILS
    // ==========================================

    if (updateData.refurbishedDetails) {

        const currentDetails =
            existingProduct.refurbishedDetails?.toObject?.() ||
            existingProduct.refurbishedDetails ||
            {};

        const details = {
            ...currentDetails,
            ...updateData.refurbishedDetails
        };

        if (details.grade === "") {
            details.grade = null;
        }

        if (details.testingStatus === "") {
            details.testingStatus = null;
        }

        updateData.refurbishedDetails = details;

    }


    // ==========================================
    // RENTAL DETAILS
    // ==========================================

    const rentalData = updateData.rental
        ? { ...updateData.rental }
        : null;

    if (rentalData) {

        // Product model stores only this flag.
        updateData.rental = {
            isAvailableForRent:
                rentalData.isAvailableForRent ??
                existingProduct.rental?.isAvailableForRent ??
                false
        };

        const existingRental = await RentalProduct.findOne({
            productId: id
        });

        if (existingRental) {

            const allowedRentalFields = [
                "isAvailableForRent",
                "monthlyRent",
                "securityDeposit",
                "minimumRentalMonths",
                "gst",
                "basicSoftwareInstalled",
                "includedItems",
                "notes"
            ];

            const rentalUpdates = {};

            allowedRentalFields.forEach((field) => {
                if (rentalData[field] !== undefined) {
                    rentalUpdates[field] = rentalData[field];
                }
            });

            // Quantities intentionally excluded.
            // They are controlled by rental allocation/return.

            if (Object.keys(rentalUpdates).length > 0) {
                await RentalProduct.findByIdAndUpdate(
                    existingRental._id,
                    { $set: rentalUpdates },
                    { new: true, runValidators: true }
                );
            }

        } else if (
            rentalData.isAvailableForRent === true
        ) {

            throw new Error(
                "Rental record not found. Configure rental details first."
            );

        }

    }


    // ==========================================
    // SLUG
    // ==========================================

    if (updateData.name) {
        updateData.slug = generateSlug(updateData.name);
    }


    // ==========================================
    // UPDATE PRODUCT
    // ==========================================

    const product = await updateProductDB(
        id,
        updateData
    );

    if (!product) {
        throw new Error("Product not found");
    }

    return product;

};


// =====================================================
// DELETE PRODUCT
// =====================================================

export const deleteProductService = async (
    id
) => {

    const product =
        await deleteProductDB(
            id
        );

    if (!product) {

        throw new Error(
            "Product not found"
        );

    }

    return product;

};


// =====================================================
// SEARCH PRODUCTS
// =====================================================

export const searchProductService = async (
    keyword
) => {

    return await searchProductsDB(
        keyword
    );

};


// =====================================================
// CUSTOMER SHOP PRODUCTS
// =====================================================

export const getShopProductsService = async (
    customerType = "PERSONAL"
) => {

    try {

        console.log(
            "======================================"
        );

        console.log(
            "GET SHOP PRODUCTS SERVICE"
        );

        console.log(
            "CUSTOMER TYPE:",
            customerType
        );

        console.log(
            "======================================"
        );


        // =================================================
        // GET ACTIVE PRODUCTS
        // =================================================

        const products =
            await getShopProductsDB();

        console.log(
            "SHOP PRODUCTS COUNT:",
            products.length
        );


        // =================================================
        // GET ACTIVE OFFERS
        // =================================================

        const activeOffers =
            await getActiveOffersDB();

        console.log(
            "ACTIVE OFFERS COUNT:",
            activeOffers.length
        );


        // =================================================
        // APPLY OFFERS
        // =================================================

        const productsWithOffers =
            products.map(
                (product) => {

                    // MONGOOSE DOCUMENT -> OBJECT
                    const productData =
                        typeof product.toObject
                        === "function"

                            ? product.toObject()

                            : product;

                    // FIND OFFER
                    const offer =
                        matchOfferToProduct(
                            productData,
                            activeOffers
                        );

                    // CUSTOMER PRICE
                    const customerPrice =
                        getCustomerPrice(
                            productData,
                            customerType
                        );

                    // FINAL PRICE
                    const finalPrice =
                        customerPrice !== null

                            ? calculateDiscountedPrice(
                                customerPrice,
                                offer
                            )

                            : null;

                    // SAFE PRICING
                    const safePricing =
                        getSafePricing(
                            productData,
                            customerType
                        );

                    // RETURN PRODUCT
                    return {

                        ...productData,

                        pricing:
                            safePricing,

                        customerType,

                        customerPrice,

                        offer:
                            offer
                            || null,

                        finalPrice

                    };

                }
            );

        console.log(
            "FINAL SHOP PRODUCTS:",
            productsWithOffers.length
        );

        return productsWithOffers;


    } catch (error) {

        console.error(
            "GET SHOP PRODUCTS SERVICE ERROR:",
            error
        );

        throw error;

    }

};