import express from "express";


import {

createProduct,
getProducts,
getProductById,
updateProduct,
deleteProduct,
searchProduct,
getShopProducts

} from "./product.controller.js";
import {
    createProductValidation,
    updateProductValidation
} from "./product.validation.js";

import {
validate
} from "../../common/middleware/validate.middleware.js";


import { verifyToken } from "../../common/middleware/auth.middleware.js";
import { allowRoles } from "../../common/middleware/role.middleware.js";

import {productUpload} from "../../common/middleware/upload.middleware.js";

const router = express.Router();




// ==========================
// ADMIN PRODUCT ROUTES
// ==========================



// Create Product

router.post(
    "/",
    verifyToken,
    allowRoles("ADMIN"),
    validate(createProductValidation),
    productUpload.array("images",5),
    createProduct

);



// Get All Products

router.get(
    "/",
    verifyToken,
    allowRoles("ADMIN"),
    getProducts
);




// Get Single Product

router.get(
    "/:id",
    verifyToken,
    allowRoles("ADMIN"),
    getProductById
);




// Update Product

router.put(
    "/:id",
    verifyToken,
    allowRoles("ADMIN"),
    validate(updateProductValidation),
    updateProduct
);


// Delete Product

router.delete(
    "/:id",
    verifyToken,
    allowRoles("ADMIN"),
    deleteProduct
);




// Search Product

router.get(
    "/search",
    verifyToken,
    allowRoles("ADMIN"),
    searchProduct
);





// ==========================
// CUSTOMER SHOP ROUTE
// ==========================


router.get(
    "/shop",
    getShopProducts
);



export default router;