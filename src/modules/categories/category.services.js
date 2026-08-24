import {

createCategoryDB,
getCategoriesDB,
getCategoryByIdDB,
updateCategoryDB,
deleteCategoryDB

} from "./category.repository.js";




import Category from "./category.model.js";

export const createCategoryService = async (data, userId) => {

    data.createdBy = userId;

    // --------------------------------
    // Parent Category Validation
    // --------------------------------

    if (data.parentCategory) {

        const parentCategory = await Category.findOne({
            _id: data.parentCategory,
            isDeleted: false
        });

        if (!parentCategory) {
            throw new Error("Parent category not found");
        }

        if (parentCategory.status !== "ACTIVE") {
            throw new Error("Parent category is inactive");
        }
    } else {
        data.parentCategory = null;
    }

    // --------------------------------
    // Slug
    // --------------------------------

    data.slug = data.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");

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