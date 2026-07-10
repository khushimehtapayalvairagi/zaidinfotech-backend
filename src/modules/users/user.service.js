import bcrypt from "bcrypt";
import User from "./user.model.js";
import * as userRepository from "./user.repository.js";

// ===============================
// Create User
// ===============================
export const createUser = async (data) => {
  // Email Check
  const existingUser = await userRepository.findByEmail(data.email);

  if (existingUser) {
    throw new Error("Email already exists");
  }

  // Phone Check
  const existingPhone = await userRepository.findByPhone(data.phone);

  if (existingPhone) {
    throw new Error("Phone number already exists");
  }

  // Password Hash
  const hashedPassword = await bcrypt.hash(data.password, 10);

  data.password = hashedPassword;

  // Employee Code Generate
  const totalUsers = await userRepository.countUsers();

  data.employeeCode = `EMP${String(totalUsers + 1).padStart(5, "0")}`;

  return await userRepository.create(data);
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

  // Check Email
  const existingEmail = await User.findOne({ email });

  if (existingEmail) {
    throw new Error("Email already exists");
  }

  // Check Phone
  const existingPhone = await User.findOne({ phone });

  if (existingPhone) {
    throw new Error("Phone number already exists");
  }

  // Hash Password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create User
  const user = await User.create({
    ...userData,
    password: hashedPassword,
  });

  return user;
};
