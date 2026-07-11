import Category from "./category.model.js";



export const createCategoryDB = async(data)=>{

    return await Category.create(data);

};



export const getCategoriesDB = async()=>{

    return await Category.find({
        isDeleted:false
    })
    .populate("parentCategory");

};



export const getCategoryByIdDB = async(id)=>{

    return await Category.findById(id);

};



export const updateCategoryDB = async(id,data)=>{

    return await Category.findByIdAndUpdate(
        id,
        data,
        {
            new:true
        }
    );

};



export const deleteCategoryDB = async(id)=>{


    return await Category.findByIdAndUpdate(
        id,
        {
            isDeleted:true
        },
        {
            new:true
        }
    );

};