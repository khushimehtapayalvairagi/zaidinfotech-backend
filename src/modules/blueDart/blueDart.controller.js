import {
    getBlueDartToken,
} from "./blueDartAuth.service.js";


export const testBlueDartAuth = async (
    req,
    res
) => {

    try {

        const token =
            await getBlueDartToken();

        return res.status(200).json({

            success: true,

            message:
                "Blue Dart JWT token generated successfully",

            tokenAvailable:
                Boolean(token),

        });

    } catch (error) {

        console.error(
            "❌ Blue Dart Auth Test Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error?.message ||
                "Blue Dart authentication failed",

        });
    }
};