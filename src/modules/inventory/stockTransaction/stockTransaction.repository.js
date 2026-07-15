import StockTransaction from "./stockTransaction.model.js";



export const createTransaction =
async(data)=>{


return await StockTransaction.create(
    data
);


};




export const getTransactions =
async(productId)=>{


return await StockTransaction.find({

product:productId

})

.populate(
"createdBy",
"name email"
)

.sort({

createdAt:-1

});


};