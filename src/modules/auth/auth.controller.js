
import { loginSchema } from "./auth.validation.js";
import { loginService,getProfileService } from "./auth.service.js";

export const login = async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    const response = await loginService(data);

    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
export const getProfile = async (req, res) => {
  try {
    const response = await getProfileService(req.user.id);

    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};