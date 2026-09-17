
import {
  financialReportsService
} from "./financialReports.service.js";


// ======================================================
// DAILY
// ======================================================

export const getDailyCollectionController =
  async (req, res) => {

    try {

      const data =
        await financialReportsService
          .getDailyCollection();


      return res.status(200).json({

        success: true,

        data

      });

    } catch (error) {

      return res.status(500).json({

        success: false,

        message:
          error.message

      });
    }
  };


// ======================================================
// MONTHLY
// ======================================================

export const getMonthlyCollectionController =
  async (req, res) => {

    try {

      const data =
        await financialReportsService
          .getMonthlyCollection();


      return res.status(200).json({

        success: true,

        data

      });

    } catch (error) {

      return res.status(500).json({

        success: false,

        message:
          error.message

      });
    }
  };


// ======================================================
// GENERAL SUMMARY
// ======================================================

export const getFinancialSummaryController =
  async (req, res) => {

    try {

      const {
        from,
        to
      } = req.query;


      const data =
        await financialReportsService
          .getFinancialSummary(
            from,
            to
          );


      return res.status(200).json({

        success: true,

        data

      });

    } catch (error) {

      return res.status(500).json({

        success: false,

        message:
          error.message

      });
    }
  };


// ======================================================
// SALES
// ======================================================

export const getSalesCollectionController =
  async (req, res) => {

    try {

      const {
        from,
        to
      } = req.query;


      const data =
        await financialReportsService
          .getSalesCollection(
            ...getDateArguments(
              from,
              to
            )
          );


      return res.status(200).json({

        success: true,

        data: {
          totalCollection:
            data
        }

      });

    } catch (error) {

      return res.status(500).json({

        success: false,

        message:
          error.message

      });
    }
  };


// ======================================================
// REPAIR
// ======================================================

export const getRepairCollectionController =
  async (req, res) => {

    try {

      const {
        from,
        to
      } = req.query;


      const {
        start,
        end
      } =
        getDateRange(
          from,
          to
        );


      const data =
        await financialReportsService
          .getRepairCollection(
            start,
            end
          );


      return res.status(200).json({

        success: true,

        data: {
          totalCollection:
            data
        }

      });

    } catch (error) {

      return res.status(500).json({

        success: false,

        message:
          error.message

      });
    }
  };


// ======================================================
// RENTAL
// ======================================================

export const getRentalCollectionController =
  async (req, res) => {

    try {

      const {
        from,
        to
      } = req.query;


      const {
        start,
        end
      } =
        getDateRange(
          from,
          to
        );


      const data =
        await financialReportsService
          .getRentalCollection(
            start,
            end
          );


      return res.status(200).json({

        success: true,

        data: {
          totalCollection:
            data
        }

      });

    } catch (error) {

      return res.status(500).json({

        success: false,

        message:
          error.message

      });
    }
  };


// ======================================================
// VENDOR PAYMENTS
// ======================================================

export const getVendorPaymentsController =
  async (req, res) => {

    try {

      const {
        from,
        to
      } = req.query;


      const {
        start,
        end
      } =
        getDateRange(
          from,
          to
        );


      const data =
        await financialReportsService
          .getVendorPayments(
            start,
            end
          );


      return res.status(200).json({

        success: true,

        data: {
          totalVendorPayments:
            data
        }

      });

    } catch (error) {

      return res.status(500).json({

        success: false,

        message:
          error.message

      });
    }
  };


// ======================================================
// PENDING PAYMENTS
// ======================================================

export const getPendingPaymentsController =
  async (req, res) => {

    try {

      const data =
        await financialReportsService
          .getPendingVendorPaymentsReport();


      return res.status(200).json({

        success: true,

        data

      });

    } catch (error) {

      return res.status(500).json({

        success: false,

        message:
          error.message

      });
    }
  };


// ======================================================
// PAYMENT METHOD
// ======================================================

export const getPaymentMethodController =
  async (req, res) => {

    try {

      const {
        from,
        to
      } = req.query;


      const {
        start,
        end
      } =
        getDateRange(
          from,
          to
        );


      const data =
        await financialReportsService
          .getPaymentMethodReport(
            start,
            end
          );


      return res.status(200).json({

        success: true,

        data

      });

    } catch (error) {

      return res.status(500).json({

        success: false,

        message:
          error.message

      });
    }
  };


// ======================================================
// PROFIT LOSS
// ======================================================

export const getProfitLossController =
  async (req, res) => {

    try {

      const {
        from,
        to
      } = req.query;


      const data =
        await financialReportsService
          .getProfitLossReport(
            from,
            to
          );


      return res.status(200).json({

        success: true,

        data

      });

    } catch (error) {

      return res.status(500).json({

        success: false,

        message:
          error.message

      });
    }
  };


// ======================================================
// DATE HELPERS
// ======================================================

const getDateRange = (
  from,
  to
) => {

  const start =
    from
      ? new Date(from)
      : new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1
        );


  const end =
    to
      ? new Date(to)
      : new Date();


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


const getDateArguments = (
  from,
  to
) => {

  const {
    start,
    end
  } =
    getDateRange(
      from,
      to
    );


  return [
    start,
    end
  ];
};

