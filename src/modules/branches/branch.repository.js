import Branch from "./branch.model.js";

export const createBranch = async (data) => {
    return await Branch.create(data);
};

export const findBranchById = async (id) => {
    return await Branch.findOne({
        _id: id,
        isDeleted: false
    });
};

export const findBranchByCode = async (code, excludeId = null) => {
    const filter = {
        code: code.toUpperCase(),
        isDeleted: false
    };

    if (excludeId) {
        filter._id = { $ne: excludeId };
    }

    return await Branch.findOne(filter);
};

export const findAllBranches = async (filters = {}) => {
    const query = {};

    if (filters.includeDeleted !== "true") {
        query.isDeleted = false;
    }

    if (filters.status) {
        query.status = filters.status;
    }

    return await Branch.find(query).sort({ createdAt: -1 });
};

export const updateBranch = async (id, data) => {
    return await Branch.findOneAndUpdate(
        {
            _id: id,
            isDeleted: false
        },
        { $set: data },
        {
            new: true,
            runValidators: true
        }
    );
};

export const deleteBranch = async (id) => {
    return await Branch.findOneAndUpdate(
        {
            _id: id,
            isDeleted: false
        },
        {
            $set: {
                isDeleted: true,
                status: "INACTIVE"
            }
        },
        { new: true }
    );
};