// backend/src/modules/legal/legal.service.js

const TERMS_VERSION = "2026-09-29";
const PRIVACY_VERSION = "2026-09-29";

export const getLegalPolicies = () => {
    return {
        terms: {
            version: TERMS_VERSION,
            lastUpdated: "29 September 2026",
            title: "Terms & Conditions",
            url: "/terms",
        },

        privacy: {
            version: PRIVACY_VERSION,
            lastUpdated: "29 September 2026",
            title: "Privacy Policy",
            url: "/privacy",
        },

        returns: {
            title: "Returns & Refunds",
            url: "/returns-refunds",
        },

        warranty: {
            title: "Warranty Policy",
            url: "/warranty",
        },

        shipping: {
            title: "Shipping & Delivery",
            url: "/shipping",
        },

        rental: {
            title: "Rental Terms",
            url: "/rental-terms",
        },

        repair: {
            title: "Repair Terms",
            url: "/repair-terms",
        },
    };
};

export {
    TERMS_VERSION,
    PRIVACY_VERSION,
};