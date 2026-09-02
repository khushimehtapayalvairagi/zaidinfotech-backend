// import bcrypt from "bcrypt";
// import User from "./user.model.js";
// import * as userRepository from "./user.repository.js";
// import { sendResetPasswordEmail, sendEmailVerificationOtp } from "../services/mail.service.js";
// import crypto from "crypto";


// const generateOtp = () => {
//   return Math.floor(
//     100000 + Math.random() * 900000
//   ).toString();
// };
// // ===============================
// // Create User
// // ===============================
// export const createUser = async (data) => {

//   // ==========================================
//   // Phone Check
//   // ==========================================

//   const existingPhone =
//     await userRepository.findByPhone(data.phone);

//   if (existingPhone) {
//     throw new Error("Phone number already exists");
//   }


//   // ==========================================
//   // Employee ID Generate
//   // ==========================================

//   if (data.role !== "CUSTOMER") {

//     const totalUsers =
//       await userRepository.countUsers();

//     data.employeeId =
//       `EMP${String(totalUsers + 1).padStart(5, "0")}`;
//   }


//   // ==========================================
//   // SYSTEM ACCESS
//   // ==========================================

//   if (data.hasSystemAccess) {

//     // Email Check
//     const existingUser =
//       await userRepository.findByEmail(data.email);

//     if (existingUser) {
//       throw new Error("Email already exists");
//     }


//     // Password Required
//     if (!data.password) {
//       throw new Error("Password is required");
//     }


//     // ==========================================
//     // Password Hash
//     // ==========================================

//     data.password =
//       await bcrypt.hash(data.password, 10);


//     // ==========================================
//     // EMAIL VERIFICATION
//     // ==========================================

//     const otp = generateOtp();

//     data.emailVerificationOtp =
//       otp;

//     data.emailVerificationExpires =
//       new Date(Date.now() + 10 * 60 * 1000);

//     data.isVerified = false;

//   }


//   // ==========================================
//   // WITHOUT SYSTEM ACCESS
//   // ==========================================

//   else {

//     if (!data.email) {
//       throw new Error("Email is required");
//     }

//     delete data.password;

//     data.role = "OTHER";

//     // No login access
//     data.isVerified = false;
//   }


//   // ==========================================
//   // CREATE USER
//   // ==========================================

//   const user =
//     await userRepository.create(data);


//   // ==========================================
//   // SEND OTP AFTER USER CREATED
//   // ==========================================

//   if (
//     data.hasSystemAccess &&
//     user.emailVerificationOtp
//   ) {

//     await sendEmailVerificationOtp(
//       user.email,
//       user.emailVerificationOtp
//     );

//   }


//   return user;
// };

// export const verifyEmail = async (email, otp) => {

//   const user =
//     await User.findOne({ email });

//   if (!user) {
//     throw new Error("User not found");
//   }


//   // Already verified
//   if (user.isVerified) {
//     throw new Error("Email is already verified");
//   }


//   // OTP check
//   if (
//     !user.emailVerificationOtp ||
//     user.emailVerificationOtp !== otp
//   ) {

//     throw new Error("Invalid OTP");

//   }


//   // Expiry check
//   if (
//     !user.emailVerificationExpires ||
//     user.emailVerificationExpires < new Date()
//   ) {

//     throw new Error("OTP has expired");

//   }


//   // ==========================================
//   // VERIFY EMAIL
//   // ==========================================

//   user.isVerified = true;

//   user.emailVerificationOtp = null;

//   user.emailVerificationExpires = null;

//   await user.save();


//   return user;
// };
// export const resendEmailVerificationOtp = async (email) => {

//   const user =
//     await User.findOne({ email });

//   if (!user) {
//     throw new Error("User not found");
//   }


//   if (user.isVerified) {
//     throw new Error("Email is already verified");
//   }


//   const otp = generateOtp();


//   user.emailVerificationOtp = otp;

//   user.emailVerificationExpires =
//     new Date(Date.now() + 10 * 60 * 1000);


//   await user.save();


//   await sendEmailVerificationOtp(
//     user.email,
//     otp
//   );


//   return "Verification OTP sent successfully";
// };
// // ===============================
// // Get All Users
// // ===============================
// export const getUsers = async ({ page, limit, search }) => {
//   const skip = (page - 1) * limit;

//   return await userRepository.findAll({
//     skip,
//     limit,
//     search,
//   });
// };

// // ===============================
// // Get User By Id
// // ===============================
// export const getUserById = async (id) => {
//   const user = await userRepository.findById(id);

//   if (!user) {
//     throw new Error("User not found");
//   }

//   return user;
// };

// // ===============================
// // Update User
// // ===============================
// export const updateUser = async (id, data) => {
//   const user = await userRepository.update(id, data);

//   if (!user) {
//     throw new Error("User not found");
//   }

//   return user;
// };

// // ===============================
// // Soft Delete User
// // ===============================
// export const deleteUser = async (id) => {
//   const user = await userRepository.softDelete(id);

//   if (!user) {
//     throw new Error("User not found");
//   }

//   return user;
// };


// export const registerUser = async (userData) => {

//   const { email, phone, password } = userData;

//   const existingEmail = await User.findOne({ email });

//   if (existingEmail) {
//     throw new Error("Email already exists");
//   }

//   const existingPhone = await User.findOne({ phone });

//   if (existingPhone) {
//     throw new Error("Phone number already exists");
//   }

//   const hashedPassword = await bcrypt.hash(password, 10);

//   const data = {
//     ...userData,
//     password: hashedPassword,
//     role: "CUSTOMER",
    
//   };

//   const user = await User.create(data);

//   return user;
// };


// // export const registerUser = async (userData) => {
// //   const { email, phone, password } = userData;

// //   // Check Email
// //   const existingEmail = await User.findOne({ email });

// //   if (existingEmail) {
// //     throw new Error("Email already exists");
// //   }

// //   // Check Phone
// //   const existingPhone = await User.findOne({ phone });

// //   if (existingPhone) {
// //     throw new Error("Phone number already exists");
// //   }

// //   // Hash Password
// //   const hashedPassword = await bcrypt.hash(password, 10);

// //   // Create User
// //   const user = await User.create({
// //     ...userData,
// //     password: hashedPassword,
// //   });

// //   return user;
// // };
// // ===============================
// // Update Customer Profile
// // ===============================
// export const updateCustomerProfile = async (
//   userId,
//   profileData
// ) => {

//   const user = await User.findByIdAndUpdate(
//     userId,
//     {
//       gender: profileData.gender,
//       dob: profileData.dob,
//       address: profileData.address,
//       city: profileData.city,
//       state: profileData.state,
//       pincode: profileData.pincode,
//     },
//     {
//       new: true,
//     }
//   );


//   if (!user) {
//     throw new Error("User not found");
//   }


//   return user;
// };
// // ===============================
// // Get Logged In User Profile
// // ===============================
// export const getProfile = async (userId) => {

//   const user = await User.findById(userId)
//     .select("-password");

//   if (!user) {
//     throw new Error("User not found");
//   }

//   return user;
// };


// // ===============================
// // Get Employees
// // ===============================

// export const getEmployees = async () => {

//   const employees = await userRepository.findEmployees();

//   return employees;

// };
// // ===============================
// // Update Employee Status
// // ===============================

// export const updateEmployeeStatus = async (

//   id,

//   status

// ) => {

//   const employee =
//     await userRepository.updateEmployeeStatus(
//       id,
//       status
//     );

//   if (!employee) {

//     throw new Error("Employee not found");

//   }

//   return employee;

// };



// // ===============================
// // Update Employee Salary
// // ===============================

// export const updateSalary = async(
//     id,
//     salaryData
// )=>{


//     const employee =
//     await userRepository.updateSalary(
//         id,
//         salaryData
//     );


//     if(!employee){

//         throw new Error(
//             "Employee not found"
//         );

//     }


//     return employee;

// };




// // ===============================
// // Add Salary History
// // ===============================

// export const addSalaryHistory = async(
//     id,
//     salaryData
// )=>{


//     const employee =
//     await userRepository.addSalaryHistory(
//         id,
//         salaryData
//     );


//     if(!employee){

//         throw new Error(
//             "Employee not found"
//         );

//     }


//     return employee;

// };




// // ===============================
// // Get Salary History
// // ===============================

// export const getSalaryHistory = async(id)=>{


//     const employee =
//     await userRepository.getSalaryHistory(id);


//     if(!employee){

//         throw new Error(
//             "Employee not found"
//         );

//     }


//     return employee;

// };


// export const forgotPassword = async (email) => {

//   const user = await userRepository.findByEmail(email);

//   if (!user) {
//     throw new Error("User not found");
//   }

//   const token = crypto.randomBytes(32).toString("hex");

//   await userRepository.saveResetToken(
//     user._id,
//     token,
//     new Date(Date.now() + 15 * 60 * 1000)
//   );

//    await sendResetPasswordEmail(user.email, token); 
//   // TODO:
//   // Send email containing:
//   // http://localhost:5173/reset-password/${token}

//   return "Password reset link sent successfully.";
// };


// export const resetPassword = async (
//   token,
//   password
// ) => {

//   const user =
//     await userRepository.findByResetToken(token);

//   if (!user) {
//     throw new Error("Invalid or expired token");
//   }

//   const hashedPassword = await bcrypt.hash(password, 10);

//   await userRepository.updatePassword(
//     user._id,
//     hashedPassword
//   );

//   return "Password reset successfully";
// };

import bcrypt from "bcrypt";
import crypto from "crypto";

import User from "./user.model.js";
import * as userRepository from "./user.repository.js";

import {
  sendResetPasswordEmail,
  sendEmailVerificationOtp,
} from "../services/mail.service.js";


// ======================================================
// GENERATE 6 DIGIT OTP
// ======================================================

const generateOtp = () => {
  return Math.floor(
    100000 + Math.random() * 900000
  ).toString();
};


// ======================================================
// NORMALIZE EMAIL
// ======================================================

const normalizeEmail = (email) => {
  return String(email || "")
    .trim()
    .toLowerCase();
};


// ======================================================
// CREATE USER / EMPLOYEE
// ======================================================

export const createUser = async (data) => {

  const userData = {
    ...data,
  };


  // ====================================================
  // NORMALIZE EMAIL
  // ====================================================

  if (userData.email) {
    userData.email =
      normalizeEmail(userData.email);
  }


  // ====================================================
  // PHONE CHECK
  // ====================================================

  if (userData.phone) {

    const existingPhone =
      await userRepository.findByPhone(
        userData.phone
      );

    if (existingPhone) {
      throw new Error(
        "Phone number already exists"
      );
    }
  }


  // ====================================================
  // EMPLOYEE ID
  // ====================================================

  if (
    userData.role &&
    userData.role !== "CUSTOMER"
  ) {

    const totalUsers =
      await userRepository.countUsers();

    userData.employeeId =
      `EMP${String(
        totalUsers + 1
      ).padStart(5, "0")}`;
  }


  // ====================================================
  // SYSTEM ACCESS
  // ====================================================

  if (userData.hasSystemAccess === true) {

    // ----------------------------------------------
    // EMAIL REQUIRED
    // ----------------------------------------------

    if (!userData.email) {
      throw new Error(
        "Email is required for system access"
      );
    }


    // ----------------------------------------------
    // EMAIL CHECK
    // ----------------------------------------------

    const existingUser =
      await userRepository.findByEmail(
        userData.email
      );

    if (existingUser) {
      throw new Error(
        "Email already exists"
      );
    }


    // ----------------------------------------------
    // PASSWORD REQUIRED
    // ----------------------------------------------

    if (!userData.password) {
      throw new Error(
        "Password is required"
      );
    }


    // ----------------------------------------------
    // HASH PASSWORD
    // ----------------------------------------------

    userData.password =
      await bcrypt.hash(
        userData.password,
        10
      );


    // ----------------------------------------------
    // ROLE DEFAULT
    // ----------------------------------------------

    if (!userData.role) {
      userData.role = "OTHER";
    }


    // ----------------------------------------------
    // EMAIL VERIFICATION OTP
    // ----------------------------------------------

    const otp =
      generateOtp();

    userData.emailVerificationOtp =
      otp;

    userData.emailVerificationExpires =
      new Date(
        Date.now() +
        10 * 60 * 1000
      );

    userData.isVerified = false;
  }


  // ====================================================
  // WITHOUT SYSTEM ACCESS
  // ====================================================

  else {

    delete userData.password;

    userData.role = "OTHER";

    userData.isVerified = false;

    userData.emailVerificationOtp = null;

    userData.emailVerificationExpires = null;
  }


  // ====================================================
  // CREATE USER IN DATABASE
  // ====================================================

  let user;

  try {

    user =
      await userRepository.create(
        userData
      );

  } catch (error) {

    console.error(
      "CREATE USER DATABASE ERROR:",
      error
    );

    // Mongo duplicate key
    if (error?.code === 11000) {

      if (
        error?.keyPattern?.email
      ) {
        throw new Error(
          "Email already exists"
        );
      }

      if (
        error?.keyPattern?.phone
      ) {
        throw new Error(
          "Phone number already exists"
        );
      }

      if (
        error?.keyPattern?.employeeId
      ) {
        throw new Error(
          "Employee ID already exists"
        );
      }
    }

    throw error;
  }


  // ====================================================
  // SEND EMAIL VERIFICATION OTP
  // ====================================================

  if (
    userData.hasSystemAccess === true &&
    user.emailVerificationOtp &&
    user.email
  ) {

    try {

      await sendEmailVerificationOtp(
        user.email,
        user.emailVerificationOtp
      );

      console.log(
        "===================================="
      );

      console.log(
        "VERIFICATION OTP SENT"
      );

      console.log(
        "EMAIL:",
        user.email
      );

      console.log(
        "OTP:",
        user.emailVerificationOtp
      );

      console.log(
        "===================================="
      );

    } catch (mailError) {

      console.error(
        "VERIFICATION EMAIL ERROR:",
        mailError
      );

      /*
       * IMPORTANT
       *
       * Employee is already created.
       * Do not delete employee.
       *
       * User can use Resend OTP.
       */

    }
  }


  return user;
};


// ======================================================
// CUSTOMER REGISTER
// ======================================================

export const registerUser = async (
  userData
) => {

  const email =
    normalizeEmail(
      userData.email
    );

  const phone =
    String(
      userData.phone || ""
    ).trim();

  const password =
    String(
      userData.password || ""
    );


  // ====================================================
  // VALIDATION
  // ====================================================

  if (!email) {
    throw new Error(
      "Email is required"
    );
  }

  if (!phone) {
    throw new Error(
      "Phone number is required"
    );
  }

  if (!password) {
    throw new Error(
      "Password is required"
    );
  }


  // ====================================================
  // EMAIL CHECK
  // ====================================================

  const existingEmail =
    await User.findOne({
      email,
    });

  if (existingEmail) {
    throw new Error(
      "Email already exists"
    );
  }


  // ====================================================
  // PHONE CHECK
  // ====================================================

  const existingPhone =
    await User.findOne({
      phone,
    });

  if (existingPhone) {
    throw new Error(
      "Phone number already exists"
    );
  }


  // ====================================================
  // PASSWORD HASH
  // ====================================================

  const hashedPassword =
    await bcrypt.hash(
      password,
      10
    );


  // ====================================================
  // CUSTOMER DATA
  // ====================================================

  const data = {

    ...userData,

    email,

    phone,

    password:
      hashedPassword,

    role:
      "CUSTOMER",

    department:
      "CUSTOMER",

    hasSystemAccess:
      true,

    isVerified:
      false,

    emailVerificationOtp:
      generateOtp(),

    emailVerificationExpires:
      new Date(
        Date.now() +
        10 * 60 * 1000
      ),
  };


  // ====================================================
  // CREATE CUSTOMER
  // ====================================================

  const user =
    await User.create(data);


  // ====================================================
  // SEND CUSTOMER VERIFICATION OTP
  // ====================================================

  try {

    await sendEmailVerificationOtp(
      user.email,
      user.emailVerificationOtp
    );

    console.log(
      "CUSTOMER VERIFICATION OTP SENT:",
      user.email
    );

  } catch (mailError) {

    console.error(
      "CUSTOMER VERIFICATION EMAIL ERROR:",
      mailError
    );

    /*
     * Customer exists.
     * Resend OTP can be used.
     */
  }


  return user;
};


// ======================================================
// VERIFY EMAIL
// ======================================================

export const verifyEmail = async (
  email,
  otp
) => {

  // ====================================================
  // VALIDATION
  // ====================================================

  if (!email) {
    throw new Error(
      "Email is required"
    );
  }

  if (!otp) {
    throw new Error(
      "OTP is required"
    );
  }


  // ====================================================
  // NORMALIZE
  // ====================================================

  const normalizedEmail =
    normalizeEmail(email);

  const normalizedOtp =
    String(otp).trim();


  // ====================================================
  // FIND USER
  // ====================================================

  const user =
    await User.findOne({
      email:
        normalizedEmail,
    });


  if (!user) {
    throw new Error(
      "User not found"
    );
  }


  // ====================================================
  // ALREADY VERIFIED
  // ====================================================

  if (user.isVerified === true) {
    throw new Error(
      "Email is already verified"
    );
  }


  // ====================================================
  // OTP EXISTS
  // ====================================================

  if (
    !user.emailVerificationOtp
  ) {

    throw new Error(
      "Verification OTP not found. Please resend OTP."
    );
  }


  // ====================================================
  // OTP MATCH
  // ====================================================

  if (
    String(
      user.emailVerificationOtp
    ) !== normalizedOtp
  ) {

    throw new Error(
      "Invalid OTP"
    );
  }


  // ====================================================
  // OTP EXPIRY
  // ====================================================

  if (
    !user.emailVerificationExpires ||
    user.emailVerificationExpires <
      new Date()
  ) {

    throw new Error(
      "OTP has expired. Please resend OTP."
    );
  }


  // ====================================================
  // VERIFY
  // ====================================================

  user.isVerified = true;

  user.emailVerificationOtp = null;

  user.emailVerificationExpires = null;

  await user.save();


  console.log(
    "EMAIL VERIFIED:",
    user.email
  );


  return user;
};


// ======================================================
// RESEND EMAIL VERIFICATION OTP
// ======================================================

export const resendEmailVerificationOtp =
  async (email) => {

    if (!email) {
      throw new Error(
        "Email is required"
      );
    }


    const normalizedEmail =
      normalizeEmail(email);


    // ==================================================
    // FIND USER
    // ==================================================

    const user =
      await User.findOne({
        email:
          normalizedEmail,
      });


    if (!user) {
      throw new Error(
        "User not found"
      );
    }


    // ==================================================
    // ALREADY VERIFIED
    // ==================================================

    if (user.isVerified === true) {

      throw new Error(
        "Email is already verified"
      );
    }


    // ==================================================
    // GENERATE NEW OTP
    // ==================================================

    const otp =
      generateOtp();


    user.emailVerificationOtp =
      otp;

    user.emailVerificationExpires =
      new Date(
        Date.now() +
        10 * 60 * 1000
      );


    await user.save();


    // ==================================================
    // SEND OTP
    // ==================================================

    await sendEmailVerificationOtp(
      user.email,
      otp
    );


    console.log(
      "===================================="
    );

    console.log(
      "NEW VERIFICATION OTP SENT"
    );

    console.log(
      "EMAIL:",
      user.email
    );

    console.log(
      "OTP:",
      otp
    );

    console.log(
      "===================================="
    );


    return "Verification OTP sent successfully";
  };


// ======================================================
// GET ALL USERS
// ======================================================

export const getUsers = async ({
  page = 1,
  limit = 10,
  search = "",
}) => {

  const skip =
    (page - 1) * limit;


  return await userRepository.findAll({
    skip,
    limit,
    search,
  });
};


// ======================================================
// GET USER BY ID
// ======================================================

export const getUserById = async (
  id
) => {

  const user =
    await userRepository.findById(id);


  if (!user) {
    throw new Error(
      "User not found"
    );
  }


  return user;
};


// ======================================================
// UPDATE USER
// ======================================================

export const updateUser = async (
  id,
  data
) => {

  const user =
    await userRepository.update(
      id,
      data
    );


  if (!user) {
    throw new Error(
      "User not found"
    );
  }


  return user;
};


// ======================================================
// DELETE USER
// ======================================================

export const deleteUser = async (
  id
) => {

  const user =
    await userRepository.softDelete(
      id
    );


  if (!user) {
    throw new Error(
      "User not found"
    );
  }


  return user;
};


// ======================================================
// UPDATE CUSTOMER PROFILE
// ======================================================

export const updateCustomerProfile =
  async (
    userId,
    profileData
  ) => {

    const user =
      await User.findByIdAndUpdate(
        userId,
        {
          gender:
            profileData.gender,

          dob:
            profileData.dob,

          address:
            profileData.address,

          city:
            profileData.city,

          state:
            profileData.state,

          pincode:
            profileData.pincode,
        },
        {
          new: true,
        }
      );


    if (!user) {
      throw new Error(
        "User not found"
      );
    }


    return user;
  };


// ======================================================
// GET PROFILE
// ======================================================

export const getProfile = async (
  userId
) => {

  const user =
    await User.findById(
      userId
    ).select("-password");


  if (!user) {
    throw new Error(
      "User not found"
    );
  }


  return user;
};


// ======================================================
// GET EMPLOYEES
// ======================================================

export const getEmployees =
  async () => {

    const employees =
      await userRepository.findEmployees();


    return employees;
  };


// ======================================================
// UPDATE EMPLOYEE STATUS
// ======================================================

export const updateEmployeeStatus =
  async (
    id,
    status
  ) => {

    const employee =
      await userRepository.updateEmployeeStatus(
        id,
        status
      );


    if (!employee) {
      throw new Error(
        "Employee not found"
      );
    }


    return employee;
  };


// ======================================================
// UPDATE SALARY
// ======================================================

export const updateSalary =
  async (
    id,
    salaryData
  ) => {

    const employee =
      await userRepository.updateSalary(
        id,
        salaryData
      );


    if (!employee) {
      throw new Error(
        "Employee not found"
      );
    }


    return employee;
  };


// ======================================================
// ADD SALARY HISTORY
// ======================================================

export const addSalaryHistory =
  async (
    id,
    salaryData
  ) => {

    const employee =
      await userRepository.addSalaryHistory(
        id,
        salaryData
      );


    if (!employee) {
      throw new Error(
        "Employee not found"
      );
    }


    return employee;
  };


// ======================================================
// GET SALARY HISTORY
// ======================================================

export const getSalaryHistory =
  async (
    id
  ) => {

    const employee =
      await userRepository.getSalaryHistory(
        id
      );


    if (!employee) {
      throw new Error(
        "Employee not found"
      );
    }


    return employee;
  };


// ======================================================
// FORGOT PASSWORD
// ======================================================

export const forgotPassword =
  async (
    email
  ) => {

    const normalizedEmail =
      normalizeEmail(email);


    const user =
      await userRepository.findByEmail(
        normalizedEmail
      );


    if (!user) {
      throw new Error(
        "User not found"
      );
    }


    const token =
      crypto.randomBytes(
        32
      ).toString("hex");


    const expires =
      new Date(
        Date.now() +
        15 * 60 * 1000
      );


    await userRepository.saveResetToken(
      user._id,
      token,
      expires
    );


    await sendResetPasswordEmail(
      user.email,
      token
    );


    return "Password reset link sent successfully.";
  };


// ======================================================
// RESET PASSWORD
// ======================================================

export const resetPassword =
  async (
    token,
    password
  ) => {

    if (!token) {
      throw new Error(
        "Reset token is required"
      );
    }


    if (!password) {
      throw new Error(
        "Password is required"
      );
    }


    const user =
      await userRepository.findByResetToken(
        token
      );


    if (!user) {
      throw new Error(
        "Invalid or expired token"
      );
    }


    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );


    await userRepository.updatePassword(
      user._id,
      hashedPassword
    );


    return "Password reset successfully";
  };