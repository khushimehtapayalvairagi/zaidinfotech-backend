// ======================================================
// CUSTOMER SOURCE
// "How did you come to know about ZAID Infotech?"
//
// KEY   -> saved in the database (never change a key later)
// LABEL -> shown to the user / used in reports
// ======================================================

export const CUSTOMER_SOURCES = {
  GOOGLE: "Google Search / Google Maps",
  INSTAGRAM_FACEBOOK: "Instagram / Facebook",
  YOUTUBE: "YouTube",
  REFERRAL: "Friends or Family Referral",
  EXISTING_CUSTOMER: "Existing Customer",
  SHOP_BOARD: "Walk-in / Shop Board",
  ONLINE_AD: "Online Advertisement",
  INFLUENCER: "Influencer / Blogger Recommendation",
  WHATSAPP: "WhatsApp",
  OTHER: "Other",
};

export const CUSTOMER_SOURCE_KEYS = Object.keys(CUSTOMER_SOURCES);