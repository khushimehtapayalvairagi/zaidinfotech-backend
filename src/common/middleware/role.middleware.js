// export const allowRoles = (...allowedRoles) => {
//   return (req, res, next) => {
//     try {
//       if (!req.user) {
//         return res.status(401).json({
//           success: false,
//           message: "Unauthorized",
//         });
//       }

//       if (!allowedRoles.includes(req.user.role)) {
//         return res.status(403).json({
//           success: false,
//           message: "Access Denied",
//         });
//       }

//       next();
//     } catch (error) {
//       return res.status(500).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   };
// };


export const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // 1. Check authenticated user
      if (!req.user) {
        console.log("ROLE MIDDLEWARE: User not found");

        return res.status(401).json({
          success: false,
          message: "Unauthorized: User not found",
        });
      }

      // 2. Normalize roles to avoid case/space mismatch
      const userRole = String(req.user.role || "")
        .trim()
        .toUpperCase();

      const normalizedAllowedRoles = allowedRoles.map((role) =>
        String(role).trim().toUpperCase()
      );

      // 3. Debug logs
      console.log("========== ROLE ACCESS DEBUG ==========");
      console.log("User ID:", req.user._id || req.user.id);
      console.log("User Role:", userRole);
      console.log("Allowed Roles:", normalizedAllowedRoles);
      console.log("=======================================");

      // 4. Check user role
      if (!normalizedAllowedRoles.includes(userRole)) {
        console.log("ACCESS DENIED:", userRole);

        return res.status(403).json({
          success: false,
          message: "Access Denied",
          actualRole: userRole,
          allowedRoles: normalizedAllowedRoles,
        });
      }

      // 5. Permission granted
      next();

    } catch (error) {
      console.error("ROLE MIDDLEWARE ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Role authorization failed",
        error: error.message,
      });
    }
  };
};