import User from "../users/user.model.js";

export const findUserById = async (id) => {
  return await User.findById(id).select("-password");
};
export const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};