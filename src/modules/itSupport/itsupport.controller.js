// import bcrypt from "bcrypt";
// import User from "../users/user.model.js";

// const getUserId = (req) => req.user?._id || req.user?.id || req.user?.userId;

// export const getItSupportProfile = async (req, res) => {
//     try {
//         const userId = getUserId(req);

//         if (!userId) {
//             return res.status(401).json({
//                 success: false,
//                 message: "User authentication data not found.",
//             });
//         }

//         const user = await User.findById(userId).select(
//             "name firstName lastName email phone role"
//         );

//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found.",
//             });
//         }

//         const name =
//             user.name ||
//             `${user.firstName || ""} ${user.lastName || ""}`.trim();

//         return res.status(200).json({
//             success: true,
//             data: {
//                 id: user._id,
//                 name,
//                 firstName: user.firstName || "",
//                 lastName: user.lastName || "",
//                 email: user.email || "",
//                 phone: user.phone || "",
//                 role: user.role || "",
//             },
//         });
//     } catch (error) {
//         console.error("GET IT SUPPORT PROFILE ERROR:", error);

//         return res.status(500).json({
//             success: false,
//             message: "Failed to load profile.",
//             error: error.message,
//         });
//     }
// };

// export const updateItSupportProfile = async (req, res) => {
//     try {
//         const userId = getUserId(req);

//         if (!userId) {
//             return res.status(401).json({
//                 success: false,
//                 message: "User authentication data not found.",
//             });
//         }

//         const { name, email, phone } = req.body;

//         if (!name || !email) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Name and email are required.",
//             });
//         }

//         const existingUser = await User.findOne({
//             email: email.trim(),
//             _id: { $ne: userId },
//         });

//         if (existingUser) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Email already in use.",
//             });
//         }

//         const user = await User.findById(userId);

//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found.",
//             });
//         }

//         if (user.schema.path("name")) {
//             user.name = name.trim();
//         } else {
//             const nameParts = name.trim().split(/\s+/);

//             user.firstName = nameParts[0] || "";
//             user.lastName = nameParts.slice(1).join(" ") || "";
//         }

//         user.email = email.trim();
//         user.phone = phone?.trim() || "";

//         await user.save();

//         const updatedName =
//             user.name ||
//             `${user.firstName || ""} ${user.lastName || ""}`.trim();

//         return res.status(200).json({
//             success: true,
//             message: "Profile updated successfully.",
//             data: {
//                 id: user._id,
//                 name: updatedName,
//                 email: user.email,
//                 phone: user.phone || "",
//                 role: user.role || "",
//             },
//         });
//     } catch (error) {
//         console.error("UPDATE IT SUPPORT PROFILE ERROR:", error);

//         return res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

// export const changeItSupportPassword = async (req, res) => {
//     try {
//         const userId = getUserId(req);

//         if (!userId) {
//             return res.status(401).json({
//                 success: false,
//                 message: "User authentication data not found.",
//             });
//         }

//         const { currentPassword, newPassword } = req.body;

//         if (!currentPassword || !newPassword) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Current password and new password are required.",
//             });
//         }

//         if (newPassword.length < 6) {
//             return res.status(400).json({
//                 success: false,
//                 message: "New password must be at least 6 characters long.",
//             });
//         }

//         if (currentPassword === newPassword) {
//             return res.status(400).json({
//                 success: false,
//                 message: "New password must be different from current password.",
//             });
//         }

//         const user = await User.findById(userId).select("+password");

//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found.",
//             });
//         }

//         if (!user.password) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Password is not available for this account.",
//             });
//         }

//         const isMatch = await bcrypt.compare(
//             currentPassword,
//             user.password
//         );

//         if (!isMatch) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Incorrect current password.",
//             });
//         }

//         user.password = await bcrypt.hash(newPassword, 10);

//         await user.save();

//         return res.status(200).json({
//             success: true,
//             message: "Password changed successfully.",
//         });
//     } catch (error) {
//         console.error("CHANGE IT SUPPORT PASSWORD ERROR:", error);

//         return res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

import bcrypt from "bcrypt";
import User from "../users/user.model.js";

// =====================================================
// GET USER ID
// =====================================================

const getUserId = (req) =>
    req.user?._id ||
    req.user?.id ||
    req.user?.userId;


// =====================================================
// GET IT SUPPORT PROFILE
// =====================================================

export const getItSupportProfile = async (req, res) => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User authentication data not found.",
            });
        }

        const user = await User.findById(userId).select(
            "name firstName lastName email phone role"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        const name =
            user.name ||
            `${user.firstName || ""} ${user.lastName || ""}`.trim();

        return res.status(200).json({
            success: true,
            data: {
                id: user._id,
                name,
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                phone: user.phone || "",
                role: user.role || "",
            },
        });
    } catch (error) {
        console.error("GET IT SUPPORT PROFILE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load profile.",
            error: error.message,
        });
    }
};


// =====================================================
// UPDATE IT SUPPORT PROFILE
// EMAIL OPTIONAL
// =====================================================

export const updateItSupportProfile = async (req, res) => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User authentication data not found.",
            });
        }

        const {
            name,
            email,
            phone,
        } = req.body;

        // =================================================
        // NAME REQUIRED
        // EMAIL OPTIONAL
        // PHONE OPTIONAL
        // =================================================

        if (!name || !String(name).trim()) {
            return res.status(400).json({
                success: false,
                message: "Name is required.",
            });
        }

        const trimmedName = String(name).trim();

        const trimmedEmail =
            typeof email === "string"
                ? email.trim().toLowerCase()
                : "";

        const trimmedPhone =
            typeof phone === "string"
                ? phone.trim()
                : "";

        // =================================================
        // FIND USER
        // =================================================

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        // =================================================
        // CHECK DUPLICATE EMAIL ONLY IF EMAIL PROVIDED
        // =================================================

        if (trimmedEmail) {
            const existingUser = await User.findOne({
                email: trimmedEmail,
                _id: {
                    $ne: userId,
                },
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "Email already in use.",
                });
            }
        }

        // =================================================
        // UPDATE NAME
        // =================================================

        if (user.schema.path("name")) {
            user.name = trimmedName;
        } else {
            const nameParts =
                trimmedName.split(/\s+/);

            user.firstName =
                nameParts[0] || "";

            user.lastName =
                nameParts.slice(1).join(" ") || "";
        }

        // =================================================
        // UPDATE EMAIL
        //
        // Email can be:
        // - provided
        // - empty
        // - omitted
        // =================================================

        user.email = trimmedEmail;

        // =================================================
        // UPDATE PHONE
        // =================================================

        user.phone = trimmedPhone;

        // =================================================
        // SAVE
        // =================================================

        await user.save();

        const updatedName =
            user.name ||
            `${user.firstName || ""} ${user.lastName || ""}`.trim();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            data: {
                id: user._id,
                name: updatedName,
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                phone: user.phone || "",
                role: user.role || "",
            },
        });
    } catch (error) {
        console.error(
            "UPDATE IT SUPPORT PROFILE ERROR:",
            error
        );

        // =================================================
        // DUPLICATE EMAIL
        // =================================================

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Email already in use.",
            });
        }

        // =================================================
        // MONGOOSE VALIDATION ERROR
        // =================================================

        if (error.name === "ValidationError") {
            const messages = Object.values(
                error.errors || {}
            ).map(
                (err) => err.message
            );

            return res.status(400).json({
                success: false,
                message:
                    messages.length > 0
                        ? messages.join(", ")
                        : "Validation failed.",
            });
        }

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to update profile.",
        });
    }
};


// =====================================================
// CHANGE IT SUPPORT PASSWORD
// =====================================================

export const changeItSupportPassword = async (
    req,
    res
) => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User authentication data not found.",
            });
        }

        const {
            currentPassword,
            newPassword,
        } = req.body;

        // =================================================
        // REQUIRED
        // =================================================

        if (
            !currentPassword ||
            !newPassword
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Current password and new password are required.",
            });
        }

        // =================================================
        // PASSWORD LENGTH
        // =================================================

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message:
                    "New password must be at least 6 characters long.",
            });
        }

        // =================================================
        // PASSWORD MUST BE DIFFERENT
        // =================================================

        if (
            currentPassword ===
            newPassword
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "New password must be different from current password.",
            });
        }

        // =================================================
        // GET USER
        // =================================================

        const user =
            await User.findById(userId)
                .select("+password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        if (!user.password) {
            return res.status(400).json({
                success: false,
                message:
                    "Password is not available for this account.",
            });
        }

        // =================================================
        // CHECK CURRENT PASSWORD
        // =================================================

        const isMatch =
            await bcrypt.compare(
                currentPassword,
                user.password
            );

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message:
                    "Incorrect current password.",
            });
        }

        // =================================================
        // HASH NEW PASSWORD
        // =================================================

        user.password =
            await bcrypt.hash(
                newPassword,
                10
            );

        await user.save();

        return res.status(200).json({
            success: true,
            message:
                "Password changed successfully.",
        });
    } catch (error) {
        console.error(
            "CHANGE IT SUPPORT PASSWORD ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to change password.",
        });
    }
};