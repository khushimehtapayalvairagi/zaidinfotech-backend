import Shift from "./shift.model.js";


// Create

export const createShiftDB = (data)=>{
    return Shift.create(data);
};


// Get All

export const getShiftsDB = (filter={})=>{

    return Shift.find(filter)
    .sort({
        createdAt:-1
    });

};


// Get Single

export const getShiftByIdDB = (id)=>{

    return Shift.findById(id);

};


// Update

export const updateShiftDB = (id,data)=>{

    return Shift.findByIdAndUpdate(
        id,
        data,
        {
            new:true
        }
    );

};


// Delete

export const deleteShiftDB = (id)=>{

    return Shift.findByIdAndUpdate(
        id,
        {
            status:"INACTIVE"
        },
        {
            new:true
        }
    );

};