import axios from "axios";
import blueDartConfig from "../../config/blueDart.config.js";

let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Generate new Blue Dart JWT token
 *
 * Token validity:
 * 24 hours
 *
 * We refresh 5 minutes before expiry.
 */
export const generateBlueDartToken = async () => {
    try {
        if (!blueDartConfig.enabled) {
            throw new Error(
                "Blue Dart API is disabled. Set BLUEDART_ENABLED=true"
            );
        }

        if (!blueDartConfig.clientId) {
            throw new Error(
                "Blue Dart Client ID is missing"
            );
        }

        if (!blueDartConfig.clientSecret) {
            throw new Error(
                "Blue Dart Client Secret is missing"
            );
        }

        const tokenUrl =
            `${blueDartConfig.baseUrl}${blueDartConfig.tokenPath}`;

        console.log(
            "🔐 Generating Blue Dart JWT token..."
        );

const response = await axios.get(
    tokenUrl,
    {
        headers: {
            ClientID: blueDartConfig.clientId,
            clientSecret: blueDartConfig.clientSecret,
            Accept: "application/json",
        },
        timeout: 30000,
        validateStatus: () => true,
    }
);

console.log("======================================");
console.log("BLUE DART TOKEN DEBUG");
console.log("URL:", tokenUrl);
console.log("STATUS:", response.status);
console.log("STATUS TEXT:", response.statusText);
console.log("DATA:", response.data);
console.log("======================================");
        const token =
            response?.data?.JWTToken ||
            response?.data?.jwtToken ||
            response?.data?.token ||
            response?.data?.access_token;

        if (!token) {
            console.error(
                "Blue Dart token response:",
                response?.data
            );

            throw new Error(
                "Blue Dart JWT token was not returned"
            );
        }

        /**
         * Blue Dart says JWT validity is 24 hours.
         *
         * Refresh 5 minutes before expiry.
         */
        const TOKEN_VALIDITY =
            24 * 60 * 60 * 1000;

        const REFRESH_BUFFER =
            5 * 60 * 1000;

        cachedToken = token;

        tokenExpiresAt =
            Date.now() +
            TOKEN_VALIDITY -
            REFRESH_BUFFER;

        console.log(
            "✅ Blue Dart JWT token generated successfully"
        );

        return cachedToken;

    } catch (error) {

        console.error(
            "❌ Blue Dart JWT generation failed"
        );

        console.error(
            "Status:",
            error?.response?.status
        );

        console.error(
            "Response:",
            error?.response?.data
        );

        console.error(
            "Message:",
            error?.message
        );

        throw new Error(
            error?.response?.data?.message ||
            error?.response?.data?.ErrorMessage ||
            error?.response?.data?.["Error Message"] ||
            "Unable to generate Blue Dart JWT token"
        );
    }
};


/**
 * Return cached token if valid.
 * Otherwise generate a new token.
 */
export const getBlueDartToken = async () => {

    if (
        cachedToken &&
        Date.now() < tokenExpiresAt
    ) {
        return cachedToken;
    }

    return await generateBlueDartToken();
};


/**
 * Clear cached JWT token.
 *
 * Useful when Blue Dart returns 401/403.
 */
export const clearBlueDartToken = () => {

    cachedToken = null;
    tokenExpiresAt = 0;

    console.log(
        "♻️ Blue Dart JWT cache cleared"
    );
};