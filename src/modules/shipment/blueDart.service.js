import soap from "soap";

import { BLUEDART_PRODUCT } from "../../common/constants/blueDartProduct.js";


// ======================================================
// BLUE DART PRODUCT CONFIGURATION
// ======================================================
//
// Internal product       Blue Dart API
//
// APEX                    ProductCode = A
//                         SubProductCode = ""
//
// SURFACE                 ProductCode = E
//                         SubProductCode = ""
//
// ECOM_AIR                ProductCode = A
//                         SubProductCode = P
//                         PackType = P
//
// ECOM_LITE_SURFACE       ProductCode = E
//                         SubProductCode = P
//                         PackType = ""
//
// ======================================================

const BLUE_DART_PRODUCTS = {

  [BLUEDART_PRODUCT.APEX]: {
    productCode: "A",
    subProductCode: "",
    packType: ""
  },

  [BLUEDART_PRODUCT.SURFACE]: {
    productCode: "E",
    subProductCode: "",
    packType: ""
  },

  [BLUEDART_PRODUCT.ECOM_AIR]: {
    productCode: "A",
    subProductCode: "P",
    packType: "P"
  },

  [BLUEDART_PRODUCT.ECOM_LITE_SURFACE]: {
    productCode: "E",
    subProductCode: "P",
    packType: ""
  }

};


// ======================================================
// GET PRODUCT CONFIG
// ======================================================

const getBlueDartProductConfig = (
  blueDartProduct
) => {

  const product =
    BLUE_DART_PRODUCTS[
      blueDartProduct
    ];

  if (!product) {

    throw new Error(
      `Unsupported Blue Dart product: ${blueDartProduct}`
    );

  }

  return product;
};


// ======================================================
// VALIDATE ENVIRONMENT
// ======================================================

const validateBlueDartEnvironment = () => {

  const requiredEnvironmentVariables = [

    "BLUEDART_WSDL_URL",

    "BLUEDART_LOGIN_ID",

    "BLUEDART_LICENSE_KEY",

    "BLUEDART_CUSTOMER_CODE",

    "BLUEDART_ORIGIN_AREA",

    "BLUEDART_CUSTOMER_NAME",

    "BLUEDART_PICKUP_ADDRESS1",

    "BLUEDART_PICKUP_PINCODE",

    "BLUEDART_PICKUP_PHONE",

    "BLUEDART_PICKUP_EMAIL"

  ];


  const missingVariables =
    requiredEnvironmentVariables.filter(
      (key) =>
        !process.env[key] ||
        String(process.env[key]).trim() === ""
    );


  if (missingVariables.length > 0) {

    throw new Error(
      `Missing Blue Dart environment variables: ${missingVariables.join(", ")}`
    );

  }

};


// ======================================================
// BUILD BLUE DART PROFILE
// ======================================================

const getBlueDartProfile = () => {

  return {

    LoginID:
      process.env.BLUEDART_LOGIN_ID,

    LicenceKey:
      process.env.BLUEDART_LICENSE_KEY,

    Api_type:
      process.env.BLUEDART_API_TYPE || "S",

    Version:
      process.env.BLUEDART_VERSION || "1.10",

    Area:
      process.env.BLUEDART_ORIGIN_AREA

  };

};


// ======================================================
// GET INDIA DATE/TIME
// ======================================================
//
// Blue Dart PickupTime = HHMM
//
// Server UTC hone par bhi India time use hoga.
// ======================================================

const getIndiaDateParts = () => {

  const formatter =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Asia/Kolkata",

        year: "numeric",
        month: "2-digit",
        day: "2-digit",

        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",

        hourCycle: "h23"
      }
    );


  const parts =
    formatter.formatToParts(
      new Date()
    );


  const values = {};

  for (const part of parts) {

    if (part.type !== "literal") {

      values[part.type] =
        part.value;

    }

  }


  return values;

};


// ======================================================
// GET BLUE DART PICKUP TIME
// ======================================================

const getPickupTime = () => {

  const {
    hour,
    minute
  } = getIndiaDateParts();


  return `${hour}${minute}`;

};


// ======================================================
// GET CURRENT INDIA DATE
// ======================================================
//
// This creates a Date object representing the current
// instant. Blue Dart SOAP serializes it as DateTime.
//
// ======================================================

const getPickupDate = () => {

  return new Date();

};


// ======================================================
// GENERATE UNIQUE CREDIT REFERENCE
// ======================================================
//
// Blue Dart CreditReferenceNo max 20 characters.
// It must be unique.
//
// ======================================================

const generateCreditReferenceNo = (
  orderId
) => {

  const cleanOrderId =
    String(orderId)
      .replace(
        /[^a-zA-Z0-9]/g,
        ""
      );


  const reference =
    `ZI${cleanOrderId}`;


  return reference.slice(
    0,
    20
  );

};


// ======================================================
// GENERATE INVOICE NUMBER
// ======================================================
//
// Blue Dart InvoiceNo max 10 characters.
//
// ======================================================

const generateInvoiceNo = (
  orderId
) => {

  const cleanOrderId =
    String(orderId)
      .replace(
        /[^a-zA-Z0-9]/g,
        ""
      );


  const invoiceNumber =
    `ZI${cleanOrderId.slice(-8)}`;


  return invoiceNumber.slice(
    0,
    10
  );

};


// ======================================================
// BUILD DIMENSIONS
// ======================================================
//
// Blue Dart expects Dimensions as a LIST.
// Each entry has:
//
// Length
// Breadth
// Height
// Count
//
// ======================================================

const buildDimensions = (
  packageDetails
) => {

  const length =
    Number(
      packageDetails?.length || 0
    );

  const breadth =
    Number(
      packageDetails?.breadth || 0
    );

  const height =
    Number(
      packageDetails?.height || 0
    );

  const count =
    Number(
      packageDetails?.pieceCount || 1
    );


  // Dimensions optional.
  // Agar dimensions nahi diye gaye,
  // Dimensions field request mein nahi jayega.

  if (
    length <= 0 ||
    breadth <= 0 ||
    height <= 0
  ) {

    return null;

  }


  return [
    {
      Length: length,
      Breadth: breadth,
      Height: height,
      Count: count
    }
  ];

};


// ======================================================
// BUILD SHIPPER
// ======================================================

const buildShipper = () => {

  return {

    OriginArea:
      process.env.BLUEDART_ORIGIN_AREA,

    CustomerCode:
      process.env.BLUEDART_CUSTOMER_CODE,

    CustomerName:
      process.env.BLUEDART_CUSTOMER_NAME,

    CustomerAddress1:
      process.env.BLUEDART_PICKUP_ADDRESS1,

    CustomerAddress2:
      process.env.BLUEDART_PICKUP_ADDRESS2 || "",

    CustomerAddress3:
      process.env.BLUEDART_PICKUP_ADDRESS3 || "",

    CustomerPincode:
      process.env.BLUEDART_PICKUP_PINCODE,

    CustomerTelephone:
      process.env.BLUEDART_PICKUP_PHONE,

    CustomerMobile:
      process.env.BLUEDART_PICKUP_PHONE,

    CustomerEmailID:
      process.env.BLUEDART_PICKUP_EMAIL,

    Sender:
      process.env.BLUEDART_CUSTOMER_NAME,

    isToPayCustomer:
      false,

    VendorCode:
      ""

  };

};


// ======================================================
// BUILD CONSIGNEE
// ======================================================

const buildConsignee = (
  shippingAddress,
  customer = {}
) => {

  if (!shippingAddress) {

    throw new Error(
      "Shipping address is required for Blue Dart shipment."
    );

  }


  const fullName =
    String(
      shippingAddress.fullName ||
      [
        customer.firstName,
        customer.lastName
      ]
        .filter(Boolean)
        .join(" ") ||
      "Customer"
    )
      .trim();


  const phone =
    String(
      shippingAddress.phone ||
      customer.phone ||
      ""
    )
      .trim();


  const pincode =
    String(
      shippingAddress.pincode ||
      ""
    )
      .trim();


  if (!fullName) {

    throw new Error(
      "Consignee name is required."
    );

  }


  if (!pincode) {

    throw new Error(
      "Consignee pincode is required."
    );

  }


  if (!phone) {

    throw new Error(
      "Consignee phone number is required."
    );

  }


  return {

    ConsigneeName:
      fullName,

    ConsigneeAddress1:
      String(
        shippingAddress.addressLine ||
        ""
      ).trim(),

    ConsigneeAddress2:
      String(
        shippingAddress.landmark ||
        ""
      ).trim(),

    ConsigneeAddress3:
      "",

    ConsigneePincode:
      pincode,

    ConsigneeTelephone:
      phone,

    ConsigneeMobile:
      phone,

    ConsigneeAttention:
      fullName,

    ConsigneeEmailID:
      String(
        customer.email ||
        ""
      ).trim(),

    ConsigneeCountryCode:
      "IN",

    ConsigneeStateCode:
      String(
        shippingAddress.state ||
        ""
      ).trim(),

    ConsigneeCityName:
      String(
        shippingAddress.city ||
        ""
      ).trim(),

    ConsigneeAddressinfo:
      String(
        shippingAddress.state ||
        ""
      ).trim(),

    ConsigneeGSTNumber:
      ""

  };

};


// ======================================================
// BUILD COMMODITY
// ======================================================

const buildCommodity = (
  order
) => {

  const firstItem =
    order?.orderItems?.[0];


  const commodityName =
    firstItem?.title ||
    "Electronic Products";


  return {

    CommodityDetail1:
      String(
        commodityName
      ).slice(
        0,
        30
      ),

    CommodityDetail2:
      "ZAID INFOTECH",

    CommodityDetail3:
      ""

  };

};


// ======================================================
// BUILD BLUE DART SERVICES
// ======================================================

const buildServices = ({
  order,
  blueDartProduct,
  packageDetails
}) => {

  const product =
    getBlueDartProductConfig(
      blueDartProduct
    );


  const pieceCount =
    Number(
      packageDetails?.pieceCount || 1
    );


  const actualWeight =
    Number(
      packageDetails?.actualWeight || 0
    );


  if (
    !Number.isInteger(
      pieceCount
    ) ||
    pieceCount < 1
  ) {

    throw new Error(
      "Piece count must be at least 1."
    );

  }


  if (
    !Number.isFinite(
      actualWeight
    ) ||
    actualWeight <= 0
  ) {

    throw new Error(
      "Actual shipment weight must be greater than 0."
    );

  }


  const declaredValue =
    Number(
      order?.finalAmount ||
      order?.totalAmount ||
      0
    );


  if (
    !Number.isFinite(
      declaredValue
    ) ||
    declaredValue < 0
  ) {

    throw new Error(
      "Invalid declared shipment value."
    );

  }


  const dimensions =
    buildDimensions(
      packageDetails
    );


  const services = {

    // ==========================================
    // PRODUCT
    // ==========================================

    ProductCode:
      product.productCode,

    ProductType:
      "Dutiables",

    SubProductCode:
      product.subProductCode,

    // ==========================================
    // PACKAGE
    // ==========================================

    PieceCount:
      pieceCount,

    ActualWeight:
      actualWeight,

    // ==========================================
    // PACK TYPE
    // ==========================================

    ...(product.packType
      ? {
          PackType:
            product.packType
        }
      : {}),

    // ==========================================
    // INVOICE
    // ==========================================

    InvoiceNo:
      generateInvoiceNo(
        order._id
      ),

    SpecialInstruction:
      "",

    // ==========================================
    // VALUE
    // ==========================================

    DeclaredValue:
      declaredValue,

    // ==========================================
    // COD
    // ==========================================
    //
    // We are currently creating prepaid shipment.
    // Therefore CollectableAmount = 0.
    //
    // ==========================================

    CollactableAmount:
      0,

    // ==========================================
    // UNIQUE REFERENCE
    // ==========================================

    CreditReferenceNo:
      generateCreditReferenceNo(
        order._id
      ),

    // ==========================================
    // PICKUP
    // ==========================================

    PickupDate:
      getPickupDate(),

    PickupTime:
      getPickupTime(),

    PickupMode:
      "P",

    // ==========================================
    // OUTPUT
    // ==========================================

    PDFOutputNotRequired:
      true,

    // ==========================================
    // PICKUP REGISTRATION
    // ==========================================

    RegisterPickup:
      false

  };


  // ==========================================
  // DIMENSIONS
  // ==========================================

  if (dimensions) {

    services.Dimensions =
      dimensions;

  }


  // ==========================================
  // COMMODITY
  // ==========================================

  services.Commodity =
    buildCommodity(
      order
    );


  return services;

};


// ======================================================
// BUILD WAYBILL REQUEST
// ======================================================

const buildWaybillRequest = ({
  order,
  shippingAddress,
  customer,
  blueDartProduct,
  packageDetails
}) => {

  const request = {

    Shipper:
      buildShipper(),

    Consignee:
      buildConsignee(
        shippingAddress,
        customer
      ),

    Services:
      buildServices({
        order,
        blueDartProduct,
        packageDetails
      })

  };


  return request;

};


// ======================================================
// EXTRACT STATUS MESSAGE
// ======================================================

const getStatusMessage = (
  result
) => {

  const status =
    result?.Status ||
    result?.status;


  if (!status) {

    return "";

  }


  let statusItems = [];


  // Case 1:
  // Status = { e: [...] }

  if (
    Array.isArray(
      status?.e
    )
  ) {

    statusItems =
      status.e;

  }

  // Case 2:
  // Status = [...]

  else if (
    Array.isArray(
      status
    )
  ) {

    statusItems =
      status;

  }

  // Case 3:
  // Status = { WayBillGenerationStatus: ... }

  else if (
    status?.WayBillGenerationStatus
  ) {

    const value =
      status.WayBillGenerationStatus;

    statusItems =
      Array.isArray(value)
        ? value
        : [value];

  }

  // Case 4:
  // Single status object

  else {

    statusItems = [
      status
    ];

  }


  return statusItems
    .map(
      (item) =>
        item?.StatusInformation ||
        item?.statusInformation ||
        item?.Description ||
        ""
    )
    .filter(Boolean)
    .join("; ");

};


// ======================================================
// EXTRACT STATUS CODE
// ======================================================

const getStatusCode = (
  result
) => {

  const status =
    result?.Status ||
    result?.status;


  if (!status) {

    return "";

  }


  let statusItems = [];


  if (
    Array.isArray(
      status?.e
    )
  ) {

    statusItems =
      status.e;

  }

  else if (
    Array.isArray(
      status
    )
  ) {

    statusItems =
      status;

  }

  else if (
    status?.WayBillGenerationStatus
  ) {

    const value =
      status.WayBillGenerationStatus;

    statusItems =
      Array.isArray(value)
        ? value
        : [value];

  }

  else {

    statusItems = [
      status
    ];

  }


  return statusItems
    .map(
      (item) =>
        item?.StatusCode ||
        item?.statusCode ||
        ""
    )
    .find(Boolean) || "";

};


// ======================================================
// EXTRACT WAYBILL RESULT
// ======================================================

const extractWaybillResult = (
  response
) => {

  if (!response) {

    return null;

  }


  if (
    response.GenerateWayBillResult
  ) {

    return response.GenerateWayBillResult;

  }


  if (
    response.generateWayBillResult
  ) {

    return response.generateWayBillResult;

  }


  return response;

};


// ======================================================
// CHECK BLUE DART ERROR
// ======================================================

const isBlueDartError = (
  result
) => {

  return (
    result?.IsError === true ||
    result?.IsError === "true"
  );

};


// ======================================================
// GET SOAP CLIENT
// ======================================================

const createBlueDartClient = async () => {

  const wsdlUrl =
    process.env.BLUEDART_WSDL_URL;


  if (!wsdlUrl) {

    throw new Error(
      "BLUEDART_WSDL_URL is missing."
    );

  }


  try {

    const client =
      await soap.createClientAsync(
        wsdlUrl,
        {
          forceSoap12Headers: true
        }
      );


    return client;

  } catch (error) {

    console.error(
      "BLUE DART WSDL CONNECTION ERROR:",
      error
    );


    throw new Error(
      "Unable to connect to Blue Dart Waybill service."
    );

  }

};


// ======================================================
// GENERATE BLUE DART WAYBILL
// ======================================================

export const generateBlueDartWaybill = async ({
  order,
  shippingAddress,
  customer,
  blueDartProduct,
  packageDetails
}) => {

  // ==================================================
  // ENABLE CHECK
  // ==================================================

  if (
    process.env.BLUEDART_ENABLED !==
    "true"
  ) {

    throw new Error(
      "Blue Dart integration is disabled."
    );

  }


  // ==================================================
  // ENV VALIDATION
  // ==================================================

  validateBlueDartEnvironment();


  // ==================================================
  // INPUT VALIDATION
  // ==================================================

  if (!order) {

    throw new Error(
      "Order is required for Blue Dart shipment."
    );

  }


  if (!shippingAddress) {

    throw new Error(
      "Shipping address is required for Blue Dart shipment."
    );

  }


  if (!blueDartProduct) {

    throw new Error(
      "Blue Dart product is required."
    );

  }


  if (!packageDetails) {

    throw new Error(
      "Package details are required."
    );

  }


  // ==================================================
  // PRODUCT VALIDATION
  // ==================================================

  const product =
    getBlueDartProductConfig(
      blueDartProduct
    );


  // ==================================================
  // PROFILE
  // ==================================================

  const profile =
    getBlueDartProfile();


  // ==================================================
  // REQUEST
  // ==================================================

  const request =
    buildWaybillRequest({

      order,

      shippingAddress,

      customer,

      blueDartProduct,

      packageDetails

    });


  // ==================================================
  // SAFE LOG
  // ==================================================

  console.log(
    "=============================================="
  );

  console.log(
    "BLUE DART WAYBILL REQUEST"
  );

  console.log(
    "=============================================="
  );

  console.log({

    orderId:
      String(
        order._id
      ),

    orderType:
      order.orderType,

    blueDartProduct,

    productCode:
      product.productCode,

    subProductCode:
      product.subProductCode,

    packType:
      product.packType,

    pieceCount:
      packageDetails.pieceCount,

    actualWeight:
      packageDetails.actualWeight,

    creditReferenceNo:
      request
        .Services
        .CreditReferenceNo

  });

  console.log(
    "=============================================="
  );


  // ==================================================
  // SOAP CLIENT
  // ==================================================

  const client =
    await createBlueDartClient();


  // ==================================================
  // CALL BLUE DART
  // ==================================================

  let soapResponse;


  try {

    const response =
      await client.GenerateWayBillAsync({

        Request:
          request,

        Profile:
          profile

      });


    soapResponse =
      response?.[0];

  } catch (error) {

    console.error(
      "BLUE DART GENERATE WAYBILL ERROR:",
      error
    );


    // Do not expose credentials or raw SOAP
    // request to API client.

    const message =
      error?.response?.body ||
      error?.body ||
      error?.message ||
      "Blue Dart Waybill API request failed.";


    throw new Error(
      `Blue Dart Waybill API failed: ${String(message).slice(0, 500)}`
    );

  }


  // ==================================================
  // NORMALIZE RESPONSE
  // ==================================================

  const result =
    extractWaybillResult(
      soapResponse
    );


  if (!result) {

    throw new Error(
      "Empty response received from Blue Dart."
    );

  }


  // ==================================================
  // STATUS
  // ==================================================

  const statusCode =
    getStatusCode(
      result
    );


  const statusMessage =
    getStatusMessage(
      result
    );


  // ==================================================
  // BLUE DART ERROR
  // ==================================================

  if (
    isBlueDartError(
      result
    )
  ) {

    throw new Error(

      statusMessage ||

      statusCode ||

      "Blue Dart rejected the waybill request."

    );

  }


  // ==================================================
  // AWB
  // ==================================================

  const awbNumber =
    result?.AWBNo ||
    result?.AwbNo ||
    result?.awbNo;


  if (!awbNumber) {

    throw new Error(

      statusMessage ||

      statusCode ||

      "Blue Dart did not return an AWB number."

    );

  }


  // ==================================================
  // FINAL RESPONSE
  // ==================================================

  return {

    awbNumber:
      String(
        awbNumber
      ),

    destinationArea:
      result?.DestinationArea ||
      "",

    destinationLocation:
      result?.DestinationLocation ||
      "",

    creditReferenceNo:
      result?.CCRCRDREF ||
      request
        .Services
        .CreditReferenceNo ||
      "",

    tokenNumber:
      result?.TokenNumber ||
      "",

    shipmentPickupDate:
      result?.ShipmentPickupDate ||
      null,

    isErrorInPickup:
      result?.IsErrorInPU === true ||
      result?.IsErrorInPU === "true",

    transactionAmount:
      Number(
        result?.TransactionAmount ||
        0
      ),

    availableAmountForBooking:
      Number(
        result?.AvailableAmountForBooking ||
        0
      ),

    availableBalance:
      Number(
        result?.AvailableBalance ||
        0
      ),

    awbPrintContent:
      result?.AWBPrintContent ||
      null,

    statusCode,

    statusMessage,

    rawResponse:
      result

  };

};


// ======================================================
// TEST BLUE DART CONNECTION
// ======================================================
//
// This ONLY checks WSDL connectivity.
// It does NOT create a shipment.
// ======================================================

export const testBlueDartConnection = async () => {

  validateBlueDartEnvironment();


  const client =
    await createBlueDartClient();


  return {

    success: true,

    message:
      "Blue Dart Waybill WSDL connection successful.",

    methods:
      client.describe()

  };

};