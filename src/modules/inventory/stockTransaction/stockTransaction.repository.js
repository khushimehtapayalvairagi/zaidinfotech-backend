import StockTransaction from "./stockTransaction.model.js";



export const createTransaction =
async(data)=>{


return await StockTransaction.create(
    data
);


};




export const getTransactions = async (productId) => {

    return await StockTransaction.find({

        product: productId

    })

    .populate({

        path: "product",

        select:
            "name sku images brand category",

        populate: [

            {
                path: "brand",

                select: "name"

            },

            {
                path: "category",

                select: "name"

            }

        ]

    })

    .populate(

        "inventory",

        "currentStock reservedStock minimumStock maximumStock status unit"

    )

    .populate(

        "createdBy",

        "name email"

    )

    .sort({

        createdAt: -1

    });

};