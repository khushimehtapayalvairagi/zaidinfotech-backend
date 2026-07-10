import bcrypt from "bcrypt";
import User from "./user.model.js";

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