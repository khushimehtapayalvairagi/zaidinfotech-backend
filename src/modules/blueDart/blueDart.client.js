import axios from "axios";

import blueDartConfig from "../../config/blueDart.config.js";

import {
    getBlueDartToken,
    clearBlueDartToken,
} from "./blueDartAuth.service.js";


/**
 * Common POST request
 */
export const blueDartPost = async ({
    path,
    data,
}) => {

    if (!blueDartConfig.enabled) {
        throw new Error(
            "Blue Dart API is disabled. Set BLUEDART_ENABLED=true"
        );
    }

    const makeRequest = async (token) => {

        const url =
            `${blueDartConfig.baseUrl}${path}`;

        return await axios.post(
            url,
            data,
            {
                headers: {
                    JWTToken: token,

                    "Content-Type":
                        "application/json",
                },

                timeout: 55000,
            }
        );
    };


    try {

        const token =
            await getBlueDartToken();

        const response =
            await makeRequest(token);

        return response.data;

    } catch (error) {

        const status =
            error?.response?.status;


        /**
         * Token expired / invalid
         *
         * Clear old token
         * Generate fresh token
         * Retry once
         */
        if (
            status === 401 ||
            status === 403
        ) {

            console.log(
                "🔄 Blue Dart token invalid. Refreshing..."
            );

            clearBlueDartToken();

            const freshToken =
                await getBlueDartToken();

            const retryResponse =
                await makeRequest(
                    freshToken
                );

            return retryResponse.data;
        }


        console.error(
            "❌ Blue Dart API Error"
        );

        console.error({
            status,
            data: error?.response?.data,
            message: error?.message,
        });

        throw error;
    }
};