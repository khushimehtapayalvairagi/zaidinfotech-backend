import blueDartConfig from "../../config/blueDart.config.js";

export const getBlueDartProfile = () => {
    return {
        Api_type: blueDartConfig.apiType,
        LicenceKey: blueDartConfig.licenseKey,
        LoginID: blueDartConfig.loginId,
    };
};