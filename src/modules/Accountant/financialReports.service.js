import Order from "../orders/order.model.js";
import Payment from "../payments/payment.model.js";
import Purchase from "../Accountant/purchase.model.js";
import Product from "../products/product.model.js";
import User from "../users/user.model.js";

// ======================================================
// DATE RANGE HELPER
// ======================================================

const getDateRange = (from, to) => {
    const start = from
        ? new Date(from)
        : new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1
        );

    const end = to
        ? new Date(to)
        : new Date();

    start.setHours(0, 0, 0, 0);

    end.setHours(
        23,
        59,
        59,
        999
    );

    return {
        start,
        end
    };
};

// ======================================================
// NUMBER HELPER
// ======================================================

const getAmount = (value) => {
    const amount = Number(value);

    return Number.isFinite(amount)
        ? amount
        : 0;
};

// ======================================================
// SALES COLLECTION
// ======================================================

export const getSalesCollection = async (
    start,
    end
) => {
    const payments = await Payment.find({
        paymentFor: "ORDER",

        createdAt: {
            $gte: start,
            $lte: end
        }
    });

    return payments.reduce(
        (sum, payment) => {
            return sum + getAmount(
                payment.amount
            );
        },
        0
    );
};

// ======================================================
// SALES ORDER SUMMARY
// ======================================================

export const getSalesOrderSummary = async (
    start,
    end
) => {
    const orders = await Order.find({
        createdAt: {
            $gte: start,
            $lte: end
        },

        isDeleted: {
            $ne: true
        }
    });

    let totalSales = 0;
    let onlineSales = 0;
    let walkInSales = 0;

    let paidAmount = 0;
    let pendingAmount = 0;

    let paidOrders = 0;
    let pendingOrders = 0;

    for (const order of orders) {
        const amount = getAmount(
            order.finalAmount ??
            order.totalAmount
        );

        const paid = getAmount(
            order.paidAmount
        );

        totalSales += amount;

        paidAmount += paid;

        pendingAmount += Math.max(
            amount - paid,
            0
        );

        // ONLINE / WALK-IN
        if (order.orderSource === "WALK_IN") {
            walkInSales += amount;
        } else {
            onlineSales += amount;
        }

        // PAYMENT STATUS
        if (order.paymentStatus === "PAID") {
            paidOrders++;
        } else {
            pendingOrders++;
        }
    }

    return {
        totalOrders: orders.length,

        totalSales,

        onlineSales,

        walkInSales,

        paidAmount,

        pendingAmount,

        paidOrders,

        pendingOrders
    };
};

// ======================================================
// REPAIR COLLECTION
// ======================================================

export const getRepairCollection = async (
    start,
    end
) => {
    const payments = await Payment.find({
        paymentFor: "REPAIR",

        createdAt: {
            $gte: start,
            $lte: end
        }
    });

    return payments.reduce(
        (sum, payment) => {
            return sum + getAmount(
                payment.amount
            );
        },
        0
    );
};

// ======================================================
// RENTAL COLLECTION
// ======================================================

export const getRentalCollection = async (
    start,
    end
) => {
    const payments = await Payment.find({
        paymentFor: "RENTAL",

        createdAt: {
            $gte: start,
            $lte: end
        }
    });

    return payments.reduce(
        (sum, payment) => {
            return sum + getAmount(
                payment.amount
            );
        },
        0
    );
};

// ======================================================
// VENDOR PAYMENTS
// ======================================================

export const getVendorPayments = async (
    start,
    end
) => {
    const purchases = await Purchase.find({
        isDeleted: false,

        updatedAt: {
            $gte: start,
            $lte: end
        }
    });

    return purchases.reduce(
        (sum, purchase) => {
            return sum + getAmount(
                purchase.paidAmount
            );
        },
        0
    );
};

// ======================================================
// PENDING VENDOR PAYMENTS
// ======================================================

export const getPendingVendorPaymentsReport =
    async () => {

        const purchases = await Purchase.find({
            isDeleted: false,

            pendingAmount: {
                $gt: 0
            }
        })
            .select(
                "purchaseNumber vendorName totalAmount paidAmount pendingAmount paymentStatus"
            )
            .sort({
                createdAt: -1
            });

        const totalPending =
            purchases.reduce(
                (sum, purchase) => {
                    return sum + getAmount(
                        purchase.pendingAmount
                    );
                },
                0
            );

        return {
            totalPending,

            count: purchases.length,

            purchases
        };
    };

// ======================================================
// SALARY PAID
// ======================================================

export const getSalaryPaid = async (
    start,
    end
) => {
    const employees = await User.find({
        isDeleted: {
            $ne: true
        },

        salaryHistory: {
            $exists: true,

            $ne: []
        }
    });

    let totalSalaryPaid = 0;

    let cash = 0;
    let bank = 0;
    let upi = 0;

    const employeePayments = [];

    for (const employee of employees) {
        const salaryHistory =
            employee.salaryHistory || [];

        for (const salary of salaryHistory) {
            if (salary.status !== "PAID") {
                continue;
            }

            if (!salary.paymentDate) {
                continue;
            }

            const paymentDate =
                new Date(
                    salary.paymentDate
                );

            if (
                paymentDate < start ||
                paymentDate > end
            ) {
                continue;
            }

            const amount =
                getAmount(
                    salary.netSalary ??
                    salary.amount
                );

            totalSalaryPaid += amount;

            // PAYMENT MODE
            if (salary.paymentMode === "CASH") {
                cash += amount;
            }

            if (salary.paymentMode === "BANK") {
                bank += amount;
            }

            if (salary.paymentMode === "UPI") {
                upi += amount;
            }

            employeePayments.push({
                employeeId: employee._id,

                employeeName:
                    `${employee.firstName || ""} ${employee.lastName || ""}`
                        .trim(),

                employeeIdNumber:
                    employee.employeeId || "",

                department:
                    employee.department || "",

                role:
                    employee.role || "",

                month:
                    salary.month,

                amount,

                paymentDate:
                    salary.paymentDate,

                paymentMode:
                    salary.paymentMode || ""
            });
        }
    }

    return {
        totalSalaryPaid,

        paymentMode: {
            CASH: cash,
            BANK: bank,
            UPI: upi
        },

        count:
            employeePayments.length,

        employees:
            employeePayments
    };
};

// ======================================================
// PENDING SALARY
// ======================================================

export const getPendingSalaryReport = async () => {
    const employees = await User.find({
        isDeleted: {
            $ne: true
        },

        salaryHistory: {
            $exists: true,

            $ne: []
        }
    });

    let totalPending = 0;

    let count = 0;

    const employeesPending = [];

    for (const employee of employees) {
        const history =
            employee.salaryHistory || [];

        let employeePending = 0;

        for (const salary of history) {
            if (salary.status !== "PENDING") {
                continue;
            }

            const amount =
                getAmount(
                    salary.netSalary ??
                    salary.amount
                );

            employeePending += amount;

            totalPending += amount;

            count++;
        }

        if (employeePending > 0) {
            employeesPending.push({
                employeeId:
                    employee._id,

                employeeName:
                    `${employee.firstName || ""} ${employee.lastName || ""}`
                        .trim(),

                employeeCode:
                    employee.employeeId || "",

                department:
                    employee.department || "",

                pendingAmount:
                    employeePending
            });
        }
    }

    return {
        totalPending,

        count,

        employees:
            employeesPending
    };
};

// ======================================================
// PRODUCT SALES REPORT
// ======================================================

export const getProductSalesReport = async (
    start,
    end
) => {
    const orders = await Order.find({
        createdAt: {
            $gte: start,
            $lte: end
        },

        isDeleted: {
            $ne: true
        }
    });

    const productMap = new Map();

    for (const order of orders) {
        const items =
            order.orderItems || [];

        for (const item of items) {
            const productId =
                item.product?.toString();

            if (!productId) {
                continue;
            }

            if (!productMap.has(productId)) {
                productMap.set(
                    productId,
                    {
                        productId,

                        title:
                            item.title || "",

                        quantity: 0,

                        salesAmount: 0,

                        costAmount: 0,

                        grossProfit: 0
                    }
                );
            }

            const data =
                productMap.get(
                    productId
                );

            const quantity =
                getAmount(
                    item.quantity
                );

            const sellingPrice =
                getAmount(
                    item.price
                );

            data.quantity += quantity;

            data.salesAmount +=
                sellingPrice *
                quantity;
        }
    }

    // ==================================================
    // GET PRODUCT COST
    // ==================================================

    const productIds =
        [...productMap.keys()];

    if (productIds.length === 0) {
        return [];
    }

    const products =
        await Product.find({
            _id: {
                $in: productIds
            }
        }).select(
            "_id name purchasePrice sellingPrice"
        );

    for (const product of products) {
        const productId =
            product._id.toString();

        const data =
            productMap.get(
                productId
            );

        if (!data) {
            continue;
        }

        // IMPORTANT:
        // Product model me purchasePrice direct field hai
        const purchasePrice =
            getAmount(
                product.purchasePrice
            );

        data.costAmount =
            purchasePrice *
            data.quantity;

        data.grossProfit =
            data.salesAmount -
            data.costAmount;

        // Agar order item title available nahi tha
        // to current product name use karenge
        if (!data.title) {
            data.title =
                product.name || "";
        }
    }

    return [
        ...productMap.values()
    ];
};

// ======================================================
// EMPLOYEE / SALESPERSON SALES REPORT
// ======================================================

export const getEmployeeSalesReport =
    async (
        start,
        end
    ) => {

        const orders =
            await Order.find({
                createdAt: {
                    $gte: start,
                    $lte: end
                },

                orderSource: "WALK_IN",

                soldBy: {
                    $ne: null
                },

                isDeleted: {
                    $ne: true
                }
            }).populate(
                "soldBy",
                "firstName lastName employeeId role department"
            );

        const employeeMap =
            new Map();

        for (const order of orders) {
            if (!order.soldBy) {
                continue;
            }

            const employeeId =
                order.soldBy._id.toString();

            if (
                !employeeMap.has(
                    employeeId
                )
            ) {
                employeeMap.set(
                    employeeId,
                    {
                        employeeId:
                            order.soldBy._id,

                        employeeCode:
                            order.soldBy.employeeId || "",

                        employeeName:
                            `${order.soldBy.firstName || ""} ${order.soldBy.lastName || ""}`
                                .trim(),

                        role:
                            order.soldBy.role || "",

                        department:
                            order.soldBy.department || "",

                        totalOrders: 0,

                        totalSales: 0
                    }
                );
            }

            const data =
                employeeMap.get(
                    employeeId
                );

            data.totalOrders += 1;

            data.totalSales +=
                getAmount(
                    order.finalAmount ??
                    order.totalAmount
                );
        }

        return [
            ...employeeMap.values()
        ];
    };

// ======================================================
// PAYMENT METHOD BREAKDOWN
// ======================================================

export const getPaymentMethodReport =
    async (
        from,
        to
    ) => {

        const {
            start,
            end
        } = getDateRange(
            from,
            to
        );

        const payments =
            await Payment.find({
                createdAt: {
                    $gte: start,
                    $lte: end
                }
            });

        const breakdown = {
            CASH: 0,

            BANK: 0,

            UPI: 0,

            OTHER: 0
        };

        for (const payment of payments) {
            const mode =
                String(
                    payment.paymentMode ||
                    "OTHER"
                ).toUpperCase();

            const amount =
                getAmount(
                    payment.amount
                );

            if (
                Object.prototype.hasOwnProperty.call(
                    breakdown,
                    mode
                )
            ) {
                breakdown[mode] += amount;
            } else {
                breakdown.OTHER += amount;
            }
        }

        return breakdown;
    };

// ======================================================
// FINANCIAL SUMMARY
// ======================================================

export const getFinancialSummary =
    async (
        from,
        to
    ) => {

        const {
            start,
            end
        } = getDateRange(
            from,
            to
        );

        const [
            sales,
            repair,
            rental,
            vendorPayments,
            salesOrders,
            salary
        ] = await Promise.all([
            getSalesCollection(
                start,
                end
            ),

            getRepairCollection(
                start,
                end
            ),

            getRentalCollection(
                start,
                end
            ),

            getVendorPayments(
                start,
                end
            ),

            getSalesOrderSummary(
                start,
                end
            ),

            getSalaryPaid(
                start,
                end
            )
        ]);

        const totalCollection =
            sales +
            repair +
            rental;

        const totalExpenses =
            vendorPayments +
            salary.totalSalaryPaid;

        const netResult =
            totalCollection -
            totalExpenses;

        return {
            period: {
                from: start,

                to: end
            },

            collection: {
                sales,

                repair,

                rental,

                total:
                    totalCollection
            },

            salesOrders,

            expenses: {
                vendorPayments,

                salary:
                    salary.totalSalaryPaid,

                total:
                    totalExpenses
            },

            result: {
                income:
                    totalCollection,

                expenses:
                    totalExpenses,

                net:
                    netResult
            }
        };
    };

// ======================================================
// DAILY COLLECTION
// ======================================================

export const getDailyCollection =
    async () => {

        const now =
            new Date();

        const start =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
            );

        const end =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                23,
                59,
                59,
                999
            );

        return await getFinancialSummary(
            start,
            end
        );
    };

// ======================================================
// MONTHLY COLLECTION
// ======================================================

export const getMonthlyCollection =
    async () => {

        const now =
            new Date();

        const start =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                1
            );

        const end =
            new Date();

        return await getFinancialSummary(
            start,
            end
        );
    };

// ======================================================
// PROFIT / LOSS STYLE REPORT
// ======================================================

export const getProfitLossReport =
    async (
        from,
        to
    ) => {

        const {
            start,
            end
        } = getDateRange(
            from,
            to
        );

        const [
            sales,
            repair,
            rental,
            vendorPayments,
            salary
        ] = await Promise.all([
            getSalesCollection(
                start,
                end
            ),

            getRepairCollection(
                start,
                end
            ),

            getRentalCollection(
                start,
                end
            ),

            getVendorPayments(
                start,
                end
            ),

            getSalaryPaid(
                start,
                end
            )
        ]);

        const totalIncome =
            sales +
            repair +
            rental;

        const totalExpenses =
            vendorPayments +
            salary.totalSalaryPaid;

        const netResult =
            totalIncome -
            totalExpenses;

        return {
            period: {
                from: start,

                to: end
            },

            income: {
                sales,

                repair,

                rental,

                total:
                    totalIncome
            },

            expenses: {
                vendorPurchasePayments:
                    vendorPayments,

                salary:
                    salary.totalSalaryPaid,

                total:
                    totalExpenses
            },

            netResult
        };
    };

// ======================================================
// EXPORT ALL SERVICES
// ======================================================

export const financialReportsService = {

    getDailyCollection,

    getMonthlyCollection,

    getFinancialSummary,

    getSalesCollection,

    getSalesOrderSummary,

    getRepairCollection,

    getRentalCollection,

    getVendorPayments,

    getPendingVendorPaymentsReport,

    getSalaryPaid,

    getPendingSalaryReport,

    getProductSalesReport,

    getEmployeeSalesReport,

    getPaymentMethodReport,

    getProfitLossReport
};