import { registerSchema } from "./user.validation.js";
import { registerUser } from "./user.service.js";
import * as userService from "./user.service.js";

// ===============================
// Create User
// ===============================
export const createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);

    return res.status(201).json({
      success: true,
      message: "User Created Successfully",
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