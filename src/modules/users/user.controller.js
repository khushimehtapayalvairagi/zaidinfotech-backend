import { registerSchema } from "./user.validation.js";
import { registerUser } from "./user.service.js";
import * as userService from "./user.service.js";
import mongoose from "mongoose";
import User from "./user.model.js";



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

export const updateSalary = async(req,res)=>{

try{


const employee =
await userService.updateSalary(

req.params.id,

req.body.salaryDetails

);


res.status(200).json({

success:true,

message:"Salary updated successfully",

data:employee

});


}
catch(error){

res.status(400).json({

success:false,

message:error.message

});

}


};









// ===============================
// Add Salary History
// ===============================

export const addSalaryHistory = async(req,res)=>{

try{


const employee =
await userService.addSalaryHistory(

req.params.id,

req.body

);



res.status(200).json({

success:true,

message:"Salary payment added",

data:employee

});


}
catch(error){

res.status(400).json({

success:false,

message:error.message

});

}

};





// ===============================
// Get Salary History
// ===============================

export const getSalaryHistory = async(req,res)=>{


try{


const employee =
await userService.getSalaryHistory(
req.params.id
);



res.status(200).json({

success:true,

data:employee

});


}
catch(error){

res.status(400).json({

success:false,

message:error.message

});

}


};

export const forgotPassword = async (req, res) => {
  try {
    const result = await userService.forgotPassword(req.body.email);

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

// ======================================================
// ADD CUSTOMER BANK ACCOUNT
// ======================================================

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

    if (
      !accountHolderName ||
      !accountNumber ||
      !ifscCode ||
      !bankName
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Account holder name, account number, IFSC code and bank name are required.",
      });
    }

    const trimmedAccNo = accountNumber.trim();
    const formattedIfsc = ifscCode.trim().toUpperCase();

    const customer = await User.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    const existingAccounts = customer.bankAccounts || [];

    // Duplicate account check
    const isDuplicate = existingAccounts.some(
      (acc) => acc.accountNumber === trimmedAccNo
    );

    if (isDuplicate) {
      return res.status(409).json({
        success: false,
        message:
          "This bank account number already exists for this customer.",
      });
    }

    // First bank account automatically becomes primary
    const shouldBePrimary =
      existingAccounts.length === 0
        ? true
        : Boolean(isPrimaryForRefund);

    // If new account is primary,
    // make all previous accounts non-primary
    if (shouldBePrimary && existingAccounts.length > 0) {
      existingAccounts.forEach((account) => {
        account.isPrimaryForRefund = false;
      });
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

    customer.bankAccounts.push(newAccount);

    if (req.user?._id) {
      customer.updatedBy = req.user._id;
    }

    await customer.save();

    const addedAccount =
      customer.bankAccounts[
        customer.bankAccounts.length - 1
      ];

    return res.status(201).json({
      success: true,
      message: "Bank account added successfully.",
      data: addedAccount,
    });

  } catch (error) {
    console.error(
      "Error saving customer bank details:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error while saving bank details.",
      error: error.message,
    });
  }
};


// ======================================================
// GET ALL CUSTOMER BANK ACCOUNTS
// ======================================================

export const getCustomerBankAccounts = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID format.",
      });
    }

    const customer = await User.findOne(
      {
        _id: id,
        isDeleted: false,
      },
      {
        bankAccounts: 1,
      }
    ).lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    return res.status(200).json({
      success: true,
      count: customer.bankAccounts?.length || 0,
      data: customer.bankAccounts || [],
    });

  } catch (error) {
    console.error(
      "GET CUSTOMER BANK ACCOUNTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch bank accounts.",
      error: error.message,
    });
  }
};


// ======================================================
// GET SINGLE CUSTOMER BANK ACCOUNT
// ======================================================

export const getCustomerBankAccountById = async (
  req,
  res
) => {
  try {
    const { id, accountId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(accountId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format.",
      });
    }

    const customer = await User.findOne(
      {
        _id: id,
        isDeleted: false,
      },
      {
        bankAccounts: 1,
      }
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
      message:
        "Bank account details fetched successfully.",
      data: account,
    });

  } catch (error) {
    console.error(
      "Error fetching bank account details:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error while fetching bank account details.",
      error: error.message,
    });
  }
};


// ======================================================
// UPDATE CUSTOMER BANK ACCOUNT
// ======================================================

export const updateCustomerBankDetails = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const accountId =
      req.params.accountId ||
      req.body?._id ||
      req.body?.accountId;

    console.log(
      "UPDATE BANK ACCOUNT:",
      req.params,
      req.body
    );

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer id",
      });
    }

    if (
      !accountId ||
      !mongoose.Types.ObjectId.isValid(accountId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid bank account id is required",
      });
    }

    // User can update own account or admin can update
    if (
      req.user &&
      req.user._id.toString() !== id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not allowed",
      });
    }

    const customer = await User.findById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const bankAccount =
      customer.bankAccounts.id(accountId);

    if (!bankAccount) {
      return res.status(404).json({
        success: false,
        message: "Bank account not found",
      });
    }

    const fields = [
      "accountHolderName",
      "accountNumber",
      "ifscCode",
      "bankName",
      "branchName",
      "accountType",
      "isPrimaryForRefund",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        bankAccount[field] = req.body[field];
      }
    });

    // Format values
    if (bankAccount.accountHolderName) {
      bankAccount.accountHolderName =
        bankAccount.accountHolderName.trim();
    }

    if (bankAccount.accountNumber) {
      bankAccount.accountNumber =
        bankAccount.accountNumber.trim();
    }

    if (bankAccount.ifscCode) {
      bankAccount.ifscCode =
        bankAccount.ifscCode.trim().toUpperCase();
    }

    if (bankAccount.bankName) {
      bankAccount.bankName =
        bankAccount.bankName.trim();
    }

    if (bankAccount.branchName) {
      bankAccount.branchName =
        bankAccount.branchName.trim();
    }

    // Only one primary refund account
    if (bankAccount.isPrimaryForRefund) {
      customer.bankAccounts.forEach((acc) => {
        if (
          acc._id.toString() !==
          bankAccount._id.toString()
        ) {
          acc.isPrimaryForRefund = false;
        }
      });
    }

    if (req.user?._id) {
      customer.updatedBy = req.user._id;
    }

    await customer.save();

    return res.status(200).json({
      success: true,
      message:
        "Bank account updated successfully",
      data: bankAccount,
    });

  } catch (error) {
    console.error(
      "UPDATE BANK ACCOUNT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
