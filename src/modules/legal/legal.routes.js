import express from "express";
import {
    getLegalPoliciesController,
} from "./legal.controller.js";

const router = express.Router();

router.get(
    "/",
    getLegalPoliciesController
);

export default router;