import * as shiftRepository from "./shift.repository.js";


// Create

export const createShift = async(data)=>{

    const existing =
    await shiftRepository.getShiftsDB({
        name:data.name
    });


    if(existing.length){
        throw new Error(
            "Shift already exists"
        );
    }


    return shiftRepository.createShiftDB(data);

};



// Get All

export const getAllShifts = async()=>{

    return shiftRepository.getShiftsDB({
        status:"ACTIVE"
    });

};



// Get By ID

export const getShift = async(id)=>{

    const shift =
    await shiftRepository.getShiftByIdDB(id);


    if(!shift){
        throw new Error(
            "Shift not found"
        );
    }


    return shift;

};



// Update

export const updateShift = async(id,data)=>{

    return shiftRepository.updateShiftDB(
        id,
        data
    );

};



// Delete

export const deleteShift = async(id)=>{

    return shiftRepository.deleteShiftDB(id);

};