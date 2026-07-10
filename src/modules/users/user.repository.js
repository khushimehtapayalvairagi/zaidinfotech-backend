import User from "./user.model.js";

// Create
export const create = async (data) => {
  return await User.create(data);
};

// Find Email
export const findByEmail = async (email) => {
  return await User.findOne({ email });
};

// Find Phone
export const findByPhone = async (phone) => {
  return await User.findOne({ phone });
};

// Count Users
export const countUsers = async () => {
  return await User.countDocuments();
};

// Get All Users
export const findAll = async ({ skip, limit, search }) => {
  const query = {
    isDeleted: false,
    $or: [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { employeeCode: { $regex: search, $options: "i" } },
    ],
  };

  const users = await User.find(query)
    .select("-password")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(query);

  return {
    users,
    total,
    page: Math.ceil(skip / limit) + 1,
    totalPages: Math.ceil(total / limit),
  };
};

// Get User
export const findById = async (id) => {
  return await User.findById(id).select("-password");
};

// Update
export const update = async (id, data) => {
  return await User.findByIdAndUpdate(id, data, {
    new: true,
  }).select("-password");
};

// Soft Delete
export const softDelete = async (id) => {
  return await User.findByIdAndUpdate(
    id,
    {
      isDeleted: true,
      status: "INACTIVE",
    },
    { new: true }
  );
};