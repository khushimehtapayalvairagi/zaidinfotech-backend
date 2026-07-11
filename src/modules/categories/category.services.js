import {

createCategoryDB,
getCategoriesDB,
getCategoryByIdDB,
updateCategoryDB,
deleteCategoryDB

} from "./category.repository.js";




export const createCategoryService = async(data,userId)=>{


    data.createdBy=userId;


    data.slug=data.name
    .toLowerCase()
    .replaceAll(" ","-");


    return await createCategoryDB(data);

};




export const getCategoriesService = async()=>{

    return await getCategoriesDB();

};




export const getCategoryService = async(id)=>{

    return await getCategoryByIdDB(id);

};




export const updateCategoryService = async(id,data)=>{

    return await updateCategoryDB(id,data);

};




export const deleteCategoryService = async(id)=>{

    return await deleteCategoryDB(id);

};