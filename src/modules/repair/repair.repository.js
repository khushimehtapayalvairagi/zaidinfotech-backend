// import Repair from "./repair.model.js";

// // ======================================================
// // CREATE
// // ======================================================

// export const createRepair = async (data) => {
//   return await Repair.create(data);
// };


// // ======================================================
// // GET BY ID
// // ======================================================

// export const getRepairById = async (id) => {
//   return await Repair.findById(id)
//     .populate(
//       "user",
//       "firstName lastName name email phone"
//     )
//     .populate(
//       "product",
//       "name sku"
//     )
//     .populate(
//       "assignedTechnician",
//       "firstName lastName name email phone"
//     )
//     .populate(
//       "partsUsed.repairPart",
//       "partName partSku category sellingPrice locationBin"
//     );
// };


// // ======================================================
// // GET ALL
// // ======================================================

// export const getAllRepairs = async () => {
//   return await Repair.find()
//     .populate(
//       "user",
//       "firstName lastName name email phone"
//     )
//     .populate(
//       "product",
//       "name sku"
//     )
//     .populate(
//       "assignedTechnician",
//       "firstName lastName name email phone"
//     )
//     .populate(
//       "partsUsed.repairPart",
//       "partName partSku category sellingPrice locationBin"
//     )
//     .sort({
//       createdAt: -1,
//     });
// };


// // ======================================================
// // GET BY USER
// // ======================================================

// export const getRepairsByUser = async (
//   userId
// ) => {
//   return await Repair.find({
//     user: userId,
//   })
//     .populate("user")
//     .populate("product")
//     .populate(
//       "partsUsed.repairPart",
//       "partName partSku category sellingPrice locationBin"
//     )
//     .sort({
//       createdAt: -1,
//     });
// };


// // ======================================================
// // GET BY PRODUCT
// // ======================================================

// export const getRepairsByProduct = async (
//   productId
// ) => {
//   return await Repair.find({
//     product: productId,
//   })
//     .populate("user")
//     .populate("product")
//     .sort({
//       createdAt: -1,
//     });
// };


// // ======================================================
// // UPDATE
// // ======================================================

// export const updateRepair = async (
//   id,
//   updateData
// ) => {
//   return await Repair.findByIdAndUpdate(
//     id,
//     {
//       $set: updateData,
//     },
//     {
//       new: true,
//       runValidators: true,
//     }
//   );
// };


// // ======================================================
// // UPDATE STATUS
// // ======================================================

// export const updateRepairStatus = async (
//   id,
//   status
// ) => {
//   return await Repair.findByIdAndUpdate(
//     id,
//     {
//       $set: {
//         status,
//       },
//     },
//     {
//       new: true,
//       runValidators: true,
//     }
//   );
// };


// // ======================================================
// // DELETE
// // ======================================================

// export const deleteRepair = async (
//   id
// ) => {
//   return await Repair.findByIdAndDelete(id);
// };


// // ======================================================
// // FIND BY TECHNICIAN
// // ======================================================

// export const findByTechnician = async (
//   technicianId
// ) => {
//   return await Repair.find({
//     assignedTechnician: technicianId,
//   })
//     .populate(
//       "assignedTechnician",
//       "firstName lastName name email phone"
//     )
//     .populate(
//       "user",
//       "firstName lastName name email phone"
//     )
//     .populate(
//       "product",
//       "name sku"
//     )
//     .populate(
//       "partsUsed.repairPart",
//       "partName partSku category sellingPrice locationBin"
//     )
//     .sort({
//       createdAt: -1,
//     });
// };


// // ======================================================
// // MARK DELIVERED
// // ======================================================

// export const markDelivered = async (
//   id
// ) => {
//   return await Repair.findByIdAndUpdate(
//     id,
//     {
//       $set: {
//         status: "Delivered",
//         isDelivered: true,
//         deliveredAt: new Date(),
//       },
//     },
//     {
//       new: true,
//       runValidators: true,
//     }
//   );
// };


import Repair from "./repair.model.js";

// ======================================================
// COMMON POPULATE CONFIGURATION
// ======================================================

const populateRepair = (query) => {
  return query
    .populate(
      "user",
      "firstName lastName name email phone"
    )
    .populate(
      "product",
      "name sku"
    )
    .populate(
      "branchId",
      "name code phone email address city state pincode gstin status"
    )
    .populate(
      "assignedTechnician",
      "firstName lastName name email phone"
    )
    .populate(
      "partsUsed.repairPart",
      "partName partSku category sellingPrice locationBin"
    );
};


// ======================================================
// CREATE REPAIR
// ======================================================

export const createRepair = async (data) => {
  const repair = await Repair.create({
    ...data,
    isDeleted: false,
  });

  return populateRepair(
    Repair.findOne({
      _id: repair._id,
      isDeleted: { $ne: true },
    })
  );
};


// ======================================================
// GET REPAIR BY ID
// Excludes soft-deleted records
// ======================================================

export const getRepairById = async (id) => {
  return await populateRepair(
    Repair.findOne({
      _id: id,
      isDeleted: { $ne: true },
    })
  );
};


// ======================================================
// GET ALL REPAIRS
// Excludes soft-deleted records
// ======================================================

export const getAllRepairs = async () => {
  return await populateRepair(
    Repair.find({
      isDeleted: { $ne: true },
    }).sort({
      createdAt: -1,
    })
  );
};


// ======================================================
// GET REPAIRS BY USER
// ======================================================

export const getRepairsByUser = async (userId) => {
  return await populateRepair(
    Repair.find({
      user: userId,
      isDeleted: { $ne: true },
    }).sort({
      createdAt: -1,
    })
  );
};


// ======================================================
// GET REPAIRS BY PRODUCT
// ======================================================

export const getRepairsByProduct = async (productId) => {
  return await populateRepair(
    Repair.find({
      product: productId,
      isDeleted: { $ne: true },
    }).sort({
      createdAt: -1,
    })
  );
};


// ======================================================
// UPDATE REPAIR / EDIT JOB CARD
// ======================================================

export const updateRepair = async (
  id,
  updateData
) => {
  return await populateRepair(
    Repair.findOneAndUpdate(
      {
        _id: id,
        isDeleted: { $ne: true },
      },
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      }
    )
  );
};


// ======================================================
// UPDATE REPAIR STATUS
// ======================================================

export const updateRepairStatus = async (
  id,
  status
) => {
  return await populateRepair(
    Repair.findOneAndUpdate(
      {
        _id: id,
        isDeleted: { $ne: true },
      },
      {
        $set: {
          status,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    )
  );
};


// ======================================================
// SOFT DELETE REPAIR
// Historical Job Card remains in database
// ======================================================

export const deleteRepair = async (id) => {
  return await populateRepair(
    Repair.findOneAndUpdate(
      {
        _id: id,
        isDeleted: { $ne: true },
      },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    )
  );
};


// ======================================================
// FIND REPAIRS BY TECHNICIAN
// ======================================================

export const findByTechnician = async (
  technicianId
) => {
  return await populateRepair(
    Repair.find({
      assignedTechnician: technicianId,
      isDeleted: { $ne: true },
    }).sort({
      createdAt: -1,
    })
  );
};


// ======================================================
// MARK DELIVERED
// ======================================================

export const markDelivered = async (id) => {
  return await populateRepair(
    Repair.findOneAndUpdate(
      {
        _id: id,
        isDeleted: { $ne: true },
      },
      {
        $set: {
          status: "Delivered",
          isDelivered: true,
          deliveredAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    )
  );
};


// ======================================================
// GET DELETED REPAIRS
// Optional: Admin historical/deleted records view
// ======================================================

export const getDeletedRepairs = async () => {
  return await populateRepair(
    Repair.find({
      isDeleted: true,
    }).sort({
      updatedAt: -1,
    })
  );
};


// ======================================================
// RESTORE DELETED REPAIR
// Optional: Restore a soft-deleted Job Card
// ======================================================

export const restoreRepair = async (id) => {
  return await populateRepair(
    Repair.findOneAndUpdate(
      {
        _id: id,
        isDeleted: true,
      },
      {
        $set: {
          isDeleted: false,
        },
        $unset: {
          deletedAt: 1,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    )
  );
};