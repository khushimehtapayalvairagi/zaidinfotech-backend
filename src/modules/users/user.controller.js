import { registerSchema } from "./user.validation.js";
import { registerUser } from "./user.service.js";
import * as userService from "./user.service.js";



export const createUser = async (
  req,
  res
) => {

  try {

    const user =
      await userService.createUser(
        req.body
      );

    return res.status(201).json({

      success: true,

      message:
        "User Created Successfully",

      data: user,

    });

  } catch (error) {

    console.error(
      "CREATE USER ERROR:",
      error
    );

    return res.status(400).json({

      success: false,

      message: error.message,

    });
  }
};



// ===============================
// Get All Users
// ===============================
export const getUsers = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";

    const users = await userService.getUsers({
      page,
      limit,
      search,
    });

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      ...users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Get User By Id
// ===============================
export const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Update User
// ===============================
export const updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "User Updated Successfully",
      data: user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Soft Delete User
// ===============================
export const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);

    return res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
export const register = async (req, res) => {
  try {
    // Validate Request
    const validatedData = registerSchema.parse(req.body);

    // Save User
    const user = await registerUser(validatedData);

    res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
// ===============================
// Update Customer Profile
// ===============================
export const updateCustomerProfile = async (req, res) => {
  try {

    const userId = req.user.id;

    const user = await userService.updateCustomerProfile(
      userId,
      req.body
    );


    return res.status(200).json({
      success: true,
      message: "Customer Profile Updated Successfully",
      data: user,
    });


  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};
// ===============================
// Get Logged In User Profile
// ===============================
export const getProfile = async (req, res) => {
  try {

    const user = await userService.getProfile(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: user,
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};

// ===============================
// Get Employee List
// ===============================

export const getEmployees = async (req, res) => {

  try {

    const employees = await userService.getEmployees();

    res.status(200).json({
      success: true,
      data: employees
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};
// ===============================
// Update Employee Status
// ===============================

export const updateEmployeeStatus = async (

  req,

  res

) => {

  try {

    const employee =
      await userService.updateEmployeeStatus(

        req.params.id,

        req.body.status

      );

    return res.status(200).json({

      success: true,

      message: "Employee Status Updated",

      data: employee,

    });

  }

  catch (error) {

    return res.status(400).json({

      success: false,

      message: error.message,

    });

  }

};




// ===============================
// Update Employee Salary
// ===============================

export const updateSalary = async (req, res) => {

  try {


    const employee =
      await userService.updateSalary(

        req.params.id,

        req.body.salaryDetails

      );


    res.status(200).json({

      success: true,

      message: "Salary updated successfully",

      data: employee

    });


  }
  catch (error) {

    res.status(400).json({

      success: false,

      message: error.message

    });

  }


};





// ===============================
// Add Salary History
// ===============================

export const addSalaryHistory = async (req, res) => {

  try {


    const employee =
      await userService.addSalaryHistory(

        req.params.id,

        req.body

      );



    res.status(200).json({

      success: true,

      message: "Salary payment added",

      data: employee

    });


  }
  catch (error) {

    res.status(400).json({

      success: false,

      message: error.message

    });

  }

};





// ===============================
// Get Salary History
// ===============================

export const getSalaryHistory = async (req, res) => {


  try {


    const employee =
      await userService.getSalaryHistory(
        req.params.id
      );



    res.status(200).json({

      success: true,

      data: employee

    });


  }
  catch (error) {

    res.status(400).json({

      success: false,

      message: error.message

    });

  }


};



export const forgotPassword = async (req, res) => {
  try {
    const rawEmail = req.body?.email;

    // Validate email presence
    if (!rawEmail || typeof rawEmail !== "string" || !rawEmail.trim()) {
      return res.status(400).json({
        success: false,
        message: "A valid email address is required",
      });
    }


    const email = rawEmail.trim().toLowerCase();


    const result = await userService.forgotPassword(email);

    return res.status(200).json({
      success: true,
      message: typeof result === "string" ? result : "Password reset instructions sent to your email",
      data: typeof result === "object" ? result : undefined,
    });
  } catch (error) {

    console.error(error);


    const isClientError =
      error.statusCode === 400 ||
      error.statusCode === 404 ||
      error.name === "ValidationError" ||
      error.message?.toLowerCase().includes("not found");

    return res.status(isClientError ? 400 : 500).json({
      success: false,
      message: error.message || "Failed to process forgot password request",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const result = await userService.resetPassword(
      req.params.token,
      req.body.password
    );

    return res.status(200).json({
      success: true,
      message: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};




// ======================================================
// VERIFY EMAIL
// ======================================================

export const verifyEmail = async (
  req,
  res
) => {

  try {

    const {
      email,
      otp,
    } = req.body;

    const user =
      await userService.verifyEmail(
        email,
        otp
      );

    return res.status(200).json({

      success: true,

      message:
        "Email verified successfully",

      data: {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified,
      },

    });

  } catch (error) {

    console.error(
      "VERIFY EMAIL ERROR:",
      error
    );

    return res.status(400).json({

      success: false,

      message: error.message,

    });
  }
};

// ======================================================
// RESEND VERIFICATION OTP
// ======================================================

export const resendEmailVerificationOtp = async (
  req,
  res
) => {

  try {

    const {
      email,
    } = req.body;

    const message =
      await userService.resendEmailVerificationOtp(
        email
      );

    return res.status(200).json({

      success: true,

      message,

    });

  } catch (error) {

    console.error(
      "RESEND VERIFICATION OTP ERROR:",
      error
    );

    return res.status(400).json({

      success: false,

      message: error.message,

    });
  }
};
export const changepassword = async (req, res) => {
  try {
    // const userId = req.user.id;
    const userId = req.user?.id || req.user?._id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required",
      });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from the old password",
      });
    }

    const message = await userService.changePassword(
      userId,
      oldPassword,
      newPassword
    );

    return res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


import mongoose from "mongoose";
import User from "./user.model.js";



export const addCustomerBankAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
      branchName = "",
      accountType = "SAVINGS",
      isPrimaryForRefund = false,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID format.",
      });
    }

    const trimmedAccNo = accountNumber?.trim();
    const formattedIfsc = ifscCode?.trim().toUpperCase();

    // 1. Fetch user to check for duplicates and check existing accounts
    const customer = await User.findOne({ _id: id, isDeleted: false });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    const existingAccounts = customer.bankAccounts || [];

    // Check duplicate
    const isDuplicate = existingAccounts.some(
      (acc) => acc.accountNumber === trimmedAccNo
    );
    if (isDuplicate) {
      return res.status(409).json({
        success: false,
        message: "This bank account number already exists for this customer.",
      });
    }

    const shouldBePrimary =
      existingAccounts.length === 0 ? true : Boolean(isPrimaryForRefund);

    // If new account is primary, reset existing ones
    if (shouldBePrimary && existingAccounts.length > 0) {
      await User.updateOne(
        { _id: id },
        { $set: { "bankAccounts.$[].isPrimaryForRefund": false } }
      );
    }

    const newAccount = {
      accountHolderName: accountHolderName.trim(),
      accountNumber: trimmedAccNo,
      ifscCode: formattedIfsc,
      bankName: bankName.trim(),
      branchName: branchName.trim(),
      accountType,
      isPrimaryForRefund: shouldBePrimary,
    };

    // 2. Use findByIdAndUpdate to push without re-validating unrelated fields
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $push: { bankAccounts: newAccount },
        $set: { updatedBy: req.user?._id || null },
      },
      { new: true, runValidators: false } // runValidators: false avoids unrelated doc validation
    );

    return res.status(201).json({
      success: true,
      message: "Bank account added successfully.",
      data: updatedUser.bankAccounts,
    });
  } catch (error) {
    console.error("Error saving customer bank details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while saving bank details.",
      error: error.message,
    });
  }
};


export const getCustomerBankAccountById = async (req, res) => {
  try {
    const { id, accountId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(accountId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format.",
      });
    }

    const customer = await User.findOne(
      { _id: id, isDeleted: false },
      { bankAccounts: 1 }
    ).lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    const account = customer.bankAccounts?.find(
      (acc) => acc._id.toString() === accountId
    );

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Bank account not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Bank account details fetched successfully.",
      data: account,
    });
  } catch (error) {
    console.error("Error fetching bank account details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching bank account details.",
      error: error.message,
    });
  }
};

//get Bank Account using jwt token
export const getCustomerBankAccounts = async (req, res) => {
  try {
    // Extract user ID from authenticated JWT payload
    const userId = req.user?._id || req.user?.id;

    const customer = await User.findOne(
      {
        _id: userId,
        isDeleted: false,
      },
      {
        bankAccounts: 1,
      }
    ).lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      count: customer.bankAccounts?.length || 0,
      data: customer.bankAccounts || [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bank accounts",
      error: error.message,
    });
  }
};

 //Update Bank Account using jwt token
export const updateCustomerBankDetails = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { accountId } = req.params;

    // Allowed bank fields only
    const fields = [
      "accountHolderName",
      "accountNumber",
      "ifscCode",
      "bankName",
      "branchName",
      "accountType",
      "isPrimaryForRefund",
    ];

    // Build the subdocument update object (e.g. "bankAccounts.$[elem].bankName")
    const updateFields = {};
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateFields[`bankAccounts.$[elem].${field}`] = req.body[field];
      }
    });

    // If making this account primary, reset other accounts first
    if (req.body.isPrimaryForRefund === true) {
      await User.updateOne(
        { _id: userId },
        { $set: { "bankAccounts.$[].isPrimaryForRefund": false } }
      );
    }

    // Direct MongoDB atomic update: skips entire User document validation
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, "bankAccounts._id": accountId },
      { $set: updateFields },
      {
        arrayFilters: [{ "elem._id": accountId }],
        new: true,
        runValidators: false, // Bypasses department & shift validation completely
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Customer or bank account not found",
      });
    }

    const updatedAccount = updatedUser.bankAccounts.id(accountId);

    return res.status(200).json({
      success: true,
      message: "Bank account updated successfully",
      data: updatedAccount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};