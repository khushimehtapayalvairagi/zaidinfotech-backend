import Repair from './repair.model.js'

//create Repair Request 
export const createRepair = async (data) => {
  return await Repair.create(data)
}

//get Repair by id 
export const getRepairById = async (id) => {

  return await Repair.findById(id)

    .populate(
      "user",
      "firstName lastName email phone"
    )

    .populate(
      "product",
      "name sku"
    )

    .populate(
      "partsUsed.product",
      "name sku price"
    );
};

//get all repair
export const getAllRepairs = async () => {
  return await Repair.find()
    .populate("user").populate("product")
    .sort({ createdAt: -1 })
}

//get repair by user
export const getRepairByUser = async (userId) => {
  return await Repair.find({ userID }).
    populate("user").sort({ createdAt: -1 })
}


//update repair product
export const updateRepair = async (id, updateData) => {
  return await Repair.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  );
};

// Get Repairs By Product
export const getRepairsByProduct = async (productId) => {
  return await Repair.find({ product: productId })
    .populate("user")
    .sort({ createdAt: -1 });
};

// 
// Update Repair Status
export const updateRepairStatus = async (id, status) => {
  return await Repair.findByIdAndUpdate(
    id,
    { status },
    {
      new: true,
      runValidators: true,
    }
  );
};

// Delete Repair
export const deleteRepair = async (id) => {
  return await Repair.findByIdAndDelete(id);
};


export const findByTechnician = async (technicianId) => {
  return await RepairModel.find({ assignedTechnician: technicianId })
    .populate("assignedTechnician", "firstName lastName name email")
    .sort({ createdAt: -1 });
};

// export const findByTechnician = async (technicianId) => {
//   return await RepairModel.find({ assignedTechnician: technicianId })
//     .sort({ createdAt: -1 });
// };