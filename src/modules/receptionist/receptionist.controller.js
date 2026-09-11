

import bcrypt from "bcrypt";
import User from "../users/user.model.js";

// GET Receptionist Profile
export const getReceptionistProfile = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        const user = await User.findById(userId).select("name email phone deskNumber");

        if (!user) {
            return res.status(404).json({ success: false, message: "Receptionist not found." });
        }

        return res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// UPDATE Receptionist Profile
export const updateReceptionistProfile = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        const { name, email, phone, deskNumber } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { name, email, phone, deskNumber } },
            { new: true, runValidators: true }
        ).select("name email phone deskNumber");

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            data: updatedUser,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// CHANGE Password
export const changeReceptionistPassword = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required.",
            });
        }

        const user = await User.findById(userId).select("+password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Current password does not match." });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password updated successfully.",
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};






