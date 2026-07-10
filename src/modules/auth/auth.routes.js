import express from "express";
import { login , getProfile} from "./auth.controller.js";
import { verifyToken } from "../../common/middleware/auth.middleware.js";
import { allowRoles } from "../../common/middleware/role.middleware.js";
import { ROLES } from "../../common/constants/roles.js";

const router = express.Router();

router.get("/profile", getProfile);

router.post("/login", login);
router.get(
  "/admin",
  verifyToken,
  allowRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome Admin",
    });
  }
);


export default router;