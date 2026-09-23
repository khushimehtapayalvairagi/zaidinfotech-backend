const blueDartConfig = {
    enabled: process.env.BLUEDART_ENABLED === "true",

    baseUrl:
        process.env.BLUEDART_BASE_URL ||
        "https://apigateway.bluedart.com/in/transportation",

    clientId: process.env.BLUEDART_CLIENT_ID,
    clientSecret: process.env.BLUEDART_CLIENT_SECRET,

    loginId: process.env.BLUEDART_LOGIN_ID,
    licenseKey: process.env.BLUEDART_LICENSE_KEY,

    apiType: process.env.BLUEDART_API_TYPE || "S",

    customer: {
        code: process.env.BLUEDART_CUSTOMER_CODE,
        originArea: process.env.BLUEDART_ORIGIN_AREA,
        name: process.env.BLUEDART_CUSTOMER_NAME,
    },

    pickup: {
        address1: process.env.BLUEDART_PICKUP_ADDRESS1,
        address2: process.env.BLUEDART_PICKUP_ADDRESS2,
        address3: process.env.BLUEDART_PICKUP_ADDRESS3,
        pincode: process.env.BLUEDART_PICKUP_PINCODE,
        phone: process.env.BLUEDART_PICKUP_PHONE,
        email: process.env.BLUEDART_PICKUP_EMAIL,
    },

    tokenPath: "/token/v1/login",
};

export default blueDartConfig;

