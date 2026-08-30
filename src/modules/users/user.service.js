import bcrypt from "bcrypt";
import User from "./user.model.js";
import * as userRepository from "./user.repository.js";
import { sendResetPasswordEmail, sendEmailVerificationOtp } from "../services/mail.service.js";
import crypto from "crypto";


const generateOtp = () => {
  return Math.floor(
    100000 + Math.random() * 900000
  ).toString();
};
// ===============================
// Create User
// ===============================
export const createUser = async (data) => {

  // ==========================================
  // Phone Check
  // ==========================================

  const existingPhone =
    await userRepository.findByPhone(data.phone);

  if (existingPhone) {
    throw new Error("Phone number already exists");
  }


  // ==========================================
  // Employee ID Generate
  // ==========================================

  if (data.role !== "CUSTOMER") {

    const totalUsers =
      await userRepository.countUsers();

    data.employeeId =
      `EMP${String(totalUsers + 1).padStart(5, "0")}`;
  }


  // ==========================================
  // SYSTEM ACCESS
  // ==========================================

  if (data.hasSystemAccess) {

    // Email Check
    const existingUser =
      await userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new Error("Email already exists");
    }


    // Password Required
    if (!data.password) {
      throw new Error("Password is required");
    }


    // ==========================================
    // Password Hash
    // ==========================================

    data.password =
      await bcrypt.hash(data.password, 10);


    // ==========================================
    // EMAIL VERIFICATION
    // ==========================================

    const otp = generateOtp();

    data.emailVerificationOtp =
      otp;

    data.emailVerificationExpires =
      new Date(Date.now() + 10 * 60 * 1000);

    data.isVerified = false;

  }


  // ==========================================
  // WITHOUT SYSTEM ACCESS
  // ==========================================

  else {

    if (!data.email) {
      throw new Error("Email is required");
    }

    delete data.password;

    data.role = "OTHER";

    // No login access
    data.isVerified = false;
  }


  // ==========================================
  // CREATE USER
  // ==========================================

  const user =
    await userRepository.create(data);


  // ==========================================
  // SEND OTP AFTER USER CREATED
  // ==========================================

  if (
    data.hasSystemAccess &&
    user.emailVerificationOtp
  ) {

    await sendEmailVerificationOtp(
      user.email,
      user.emailVerificationOtp
    );

  }


  return user;
};

export const verifyEmail = async (email, otp) => {

  const user =
    await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }


  // Already verified
  if (user.isVerified) {
    throw new Error("Email is already verified");
  }


  // OTP check
  if (
    !user.emailVerificationOtp ||
    user.emailVerificationOtp !== otp
  ) {

    throw new Error("Invalid OTP");

  }


  // Expiry check
  if (
    !user.emailVerificationExpires ||
    user.emailVerificationExpires < new Date()
  ) {

    throw new Error("OTP has expired");

  }


  // ==========================================
  // VERIFY EMAIL
  // ==========================================

  user.isVerified = true;

  user.emailVerificationOtp = null;

  user.emailVerificationExpires = null;

  await user.save();


  return user;
};
export const resendEmailVerificationOtp = async (email) => {

  const user =
    await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }


  if (user.isVerified) {
    throw new Error("Email is already verified");
  }


  const otp = generateOtp();


  user.emailVerificationOtp = otp;

  user.emailVerificationExpires =
    new Date(Date.now() + 10 * 60 * 1000);


  await user.save();


  await sendEmailVerificationOtp(
    user.email,
    otp
  );


  return "Verification OTP sent successfully";
};
// ===============================
// Get All Users
// ===============================
export const getUsers = async ({ page, limit, search }) => {
  const skip = (page - 1) * limit;

  return await userRepository.findAll({
    skip,
    limit,
    search,
  });
};

// ===============================
// Get User By Id
// ===============================
export const getUserById = async (id) => {
  const user = await userRepository.findById(id);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// ===============================
// Update User
// ===============================
export const updateUser = async (id, data) => {
  const user = await userRepository.update(id, data);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// ===============================
// Soft Delete User
// ===============================
export const deleteUser = async (id) => {
  const user = await userRepository.softDelete(id);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};


export const registerUser = async (userData) => {

  const { email, phone, password } = userData;

  const existingEmail = await User.findOne({ email });

  if (existingEmail) {
    throw new Error("Email already exists");
  }

  const existingPhone = await User.findOne({ phone });

  if (existingPhone) {
    throw new Error("Phone number already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const data = {
    ...userData,
    password: hashedPassword,
    role: "CUSTOMER",
    
  };

  const user = await User.create(data);

  return user;
};


// export const registerUser = async (userData) => {
//   const { email, phone, password } = userData;

//   // Check Email
//   const existingEmail = await User.findOne({ email });

//   if (existingEmail) {
//     throw new Error("Email already exists");
//   }

//   // Check Phone
//   const existingPhone = await User.findOne({ phone });

//   if (existingPhone) {
//     throw new Error("Phone number already exists");
//   }

//   // Hash Password
//   const hashedPassword = await bcrypt.hash(password, 10);

//   // Create User
//   const user = await User.create({
//     ...userData,
//     password: hashedPassword,
//   });

//   return user;
// };
// ===============================
// Update Customer Profile
// ===============================
export const updateCustomerProfile = async (
  userId,
  profileData
) => {

  const user = await User.findByIdAndUpdate(
    userId,
    {
      gender: profileData.gender,
      dob: profileData.dob,
      address: profileData.address,
      city: profileData.city,
      state: profileData.state,
      pincode: profileData.pincode,
    },
    {
      new: true,
    }
  );


  if (!user) {
    throw new Error("User not found");
  }


  return user;
};
// ===============================
// Get Logged In User Profile
// ===============================
export const getProfile = async (userId) => {

  const user = await User.findById(userId)
    .select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};


// ===============================
// Get Employees
// ===============================

export const getEmployees = async () => {

  const employees = await userRepository.findEmployees();

  return employees;

};
// ===============================
// Update Employee Status
// ===============================

export const updateEmployeeStatus = async (

  id,

  status

) => {

  const employee =
    await userRepository.updateEmployeeStatus(
      id,
      status
    );

  if (!employee) {

    throw new Error("Employee not found");

  }

  return employee;

};



// ===============================
// Update Employee Salary
// ===============================

export const updateSalary = async(
    id,
    salaryData
)=>{


    const employee =
    await userRepository.updateSalary(
        id,
        salaryData
    );


    if(!employee){

        throw new Error(
            "Employee not found"
        );

    }


    return employee;

};




// ===============================
// Add Salary History
// ===============================

export const addSalaryHistory = async(
    id,
    salaryData
)=>{


    const employee =
    await userRepository.addSalaryHistory(
        id,
        salaryData
    );


    if(!employee){

        throw new Error(
            "Employee not found"
        );

    }


    return employee;

};




// ===============================
// Get Salary History
// ===============================

export const getSalaryHistory = async(id)=>{


    const employee =
    await userRepository.getSalaryHistory(id);


    if(!employee){

        throw new Error(
            "Employee not found"
        );

    }


    return employee;

};


export const forgotPassword = async (email) => {

  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw new Error("User not found");
  }

  const token = crypto.randomBytes(32).toString("hex");

  await userRepository.saveResetToken(
    user._id,
    token,
    new Date(Date.now() + 15 * 60 * 1000)
  );

   await sendResetPasswordEmail(user.email, token); 
  // TODO:
  // Send email containing:
  // http://localhost:5173/reset-password/${token}

  return "Password reset link sent successfully.";
};


export const resetPassword = async (
  token,
  password
) => {

  const user =
    await userRepository.findByResetToken(token);

  if (!user) {
    throw new Error("Invalid or expired token");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userRepository.updatePassword(
    user._id,
    hashedPassword
  );

  return "Password reset successfully";
};