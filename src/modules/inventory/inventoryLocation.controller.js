import * as locationService from "./inventoryLocation.service.js";

import {
    successResponse,
    errorResponse
} from "../../common/utils/apiResponse.js";


export const transferStock = async (req, res) => {

    try {

        const userId = req.user?.id || req.user?._id;

        const { productId, quantity, from, to, note } = req.body;

        const inventory =
            await locationService.transferStockService({
                productId,
                quantity,
                from,
                to,
                note,
                userId
            });

        return successResponse(
            res,
            200,
            "Stock transferred successfully",
            inventory
        );

    }
    catch (error) {

        return errorResponse(res, 400, error.message);

    }

};


export const addWarehouseStock = async (req, res) => {

    try {

        const userId = req.user?.id || req.user?._id;

        const { productId, quantity, note } = req.body;

        const inventory =
            await locationService.addWarehouseStockService({
                productId,
                quantity,
                note,
                userId
            });

        return successResponse(
            res,
            200,
            "Warehouse stock added successfully",
            inventory
        );

    }
    catch (error) {

        return errorResponse(res, 400, error.message);

    }

};


export const getTransferHistory = async (req, res) => {

    try {

        const data =
            await locationService.getTransferHistoryService(
                req.query.productId
            );

        return successResponse(
            res,
            200,
            "Transfer history fetched successfully",
            data
        );

    }
    catch (error) {

        return errorResponse(res, 500, error.message);

    }

};