import {

createCategoryService,
getCategoriesService,
getCategoryService,
updateCategoryService,
deleteCategoryService

} from "./category.services.js";





export const createCategory = async(req,res)=>{

try{


const category =
await createCategoryService(
req.body,
req.user.id
);


res.status(201).json({

success:true,
message:"Category Created",
data:category

});


}
catch(error){

res.status(500).json({
message:error.message
});

}


};





export const getCategories = async(req,res)=>{

try{

const categories =
await getCategoriesService();


res.json({
success:true,
data:categories
});


}
catch(error){

res.status(500).json({
message:error.message
});

}

};






export const getCategory = async(req,res)=>{

try{


const category =
await getCategoryService(
req.params.id
);


res.json({
success:true,
data:category
});


}
catch(error){

res.status(500).json({
message:error.message
});

}

};






export const updateCategory = async(req,res)=>{


try{


const category =
await updateCategoryService(
req.params.id,
req.body
);


res.json({

success:true,
data:category

});


}
catch(error){

res.status(500).json({
message:error.message
});

}


};







export const deleteCategory = async(req,res)=>{


try{


await deleteCategoryService(
req.params.id
);


res.json({

success:true,
message:"Category Deleted"

});


}
catch(error){

res.status(500).json({
message:error.message
});

}


};