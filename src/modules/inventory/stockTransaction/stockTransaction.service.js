import {

createTransaction,
getTransactions

}
from "./stockTransaction.repository.js";





export const createStockTransactionService =
async(data)=>{


return await createTransaction(data);


};






export const getStockTransactionsService =
async(productId)=>{


return await getTransactions(productId);


};