import axios from "axios";

import blueDartConfig from "../../config/blueDart.config.js";
import { getBlueDartToken } from "./blueDartAuth.service.js";


// =======================================
// BLUE DART TRACKING API
// =======================================

const BLUE_DART_TRACKING_URL =
    "https://apigateway.bluedart.com/in/transportation/tracking/v1";


// =======================================
// GET BLUE DART LIVE TRACKING
// =======================================

export const getBlueDartTracking = async (awbNumber) => {

    try {

        // ---------------------------------------
        // VALIDATE AWB
        // ---------------------------------------

        if (!awbNumber) {

            throw new Error(
                "Blue Dart AWB number is required"
            );

        }


        // ---------------------------------------
        // GET JWT TOKEN
        // ---------------------------------------

        const token =
            await getBlueDartToken();


        if (!token) {

            throw new Error(
                "Blue Dart JWT token not available"
            );

        }


        // ---------------------------------------
        // TRACKING PARAMETERS
        // ---------------------------------------

        const params = {

            handler: "tnt",

            action: "custawbquery",

            loginid:
                blueDartConfig.loginId,

            awb: "awb",

            numbers:
                awbNumber,

            format: "json",

            lickey:
                blueDartConfig.licenseKey,

            verno: "1",

            scan: "1"

        };


        // ---------------------------------------
        // CALL BLUE DART TRACKING API
        // ---------------------------------------

        const response = await axios.get(
            BLUE_DART_TRACKING_URL,
            {
                params,

                headers: {

                    JWTToken: token,

                    Accept: "application/json"

                },

                timeout: 30000,

                validateStatus: () => true

            }
        );


        // ---------------------------------------
        // LOG STATUS ONLY
        // ---------------------------------------

        console.log(
            "Blue Dart Tracking API Status:",
            response.status
        );


        // ---------------------------------------
        // HANDLE ERROR
        // ---------------------------------------

        if (
            response.status < 200 ||
            response.status >= 300
        ) {

            console.error(
                "Blue Dart Tracking API Error:",
                response.data
            );


            const blueDartMessage =
                response.data?.["error-response"]?.[0]?.msg ||
                response.data?.message ||
                response.data?.title;


            throw new Error(
                blueDartMessage ||
                `Blue Dart tracking failed with status ${response.status}`
            );

        }


        // ---------------------------------------
        // RETURN BLUE DART RESPONSE
        // ---------------------------------------

        return response.data;

    }

    catch (error) {

        console.error(
            "❌ Blue Dart Tracking Service Error:",
            error.message
        );

        throw error;

    }

};