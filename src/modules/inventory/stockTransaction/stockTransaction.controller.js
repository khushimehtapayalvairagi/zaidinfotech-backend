import {

createStockTransactionService,
getStockTransactionsService

}
from "./stockTransaction.service.js";




export const createTransaction = async(req,res)=>{


try{


const transaction =
await createStockTransactionService({

...req.body,

createdBy:req.user.id

});



res.status(201).json({

success:true,

data:transaction

});


}
catch(error){


res.status(400).json({

success:false,

message:error.message

});


}


};






export const getTransactions =
async(req,res)=>{


try{


const data =
await getStockTransactionsService(

req.params.productId

);



res.status(200).json({

success:true,

data

});


}
catch(error){


res.status(500).json({

success:false,

message:error.message

});


}



};