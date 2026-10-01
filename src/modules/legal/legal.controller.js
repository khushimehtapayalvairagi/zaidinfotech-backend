import { getLegalPolicies } from "./legal.service.js";

export const getLegalPoliciesController = async (req, res) => {
    try {
        const policies = getLegalPolicies();

        return res.status(200).json({
            success: true,
            message: "Legal policies fetched successfully",
            data: policies,
        });
    } catch (error) {
        console.error("GET LEGAL POLICIES ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch legal policies",
        });
    }
};