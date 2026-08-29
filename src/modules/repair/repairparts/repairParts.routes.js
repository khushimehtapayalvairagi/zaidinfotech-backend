import express from "express";
const router = express.Router();

import { verifyToken } from "../../../common/middleware/auth.middleware.js";
import { ROLES } from "../../../common/constants/roles.js";
import { allowRoles } from "../../../common/middleware/role.middleware.js";
import * as inventoryCtrl from "./repairParts.controller.js";

// Protected for both ADMIN and TECHNICIAN
router.use(verifyToken, allowRoles("ADMIN", "TECHNICIAN", "INVENTORY"));


router.route("/")
    .get(inventoryCtrl.getAllParts)
    .post(inventoryCtrl.createPart);

router.route("/:id")
    .get(inventoryCtrl.getPartById)
    .put(inventoryCtrl.updatePart)
    .delete(inventoryCtrl.deletePart);

// Repair Allocation & Stock Reversal
router.post("/attach-to-repair", inventoryCtrl.addPartToRepair);
router.delete("/:repairId/parts/:partsUsedSubId", inventoryCtrl.removePartFromRepair);

export default router;