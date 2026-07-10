import { registerSchema } from "./user.validation.js";
import { registerUser } from "./user.service.js";

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