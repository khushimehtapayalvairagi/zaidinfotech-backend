// import mongoose from "mongoose";

// const cartItemSchema = new mongoose.Schema(
//   {
//     product: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Product",
//       required: true,
//     },

//     quantity: {
//       type: Number,
//       required: true,
//       default: 1,
//       min: 1,
//     },
//     price:{
//  type:Number,
//  required:true
// },


//  originalPrice:{
//   type:Number
//  },

//  coupon: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Coupon",
//     default: null
// },

// couponCode: {
//     type: String,
//     default: ""
// },

// couponDiscount: {
//     type: Number,
//     default: 0
// },

// finalAmount: {
//     type: Number,
//     default: 0
// },

//  discountAmount:{
//   type:Number,
//   default:0
//  },


//  finalPrice:{
//   type:Number
//  }
//   },
//   {
//     _id: false,
//   }
// );

// const cartSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       unique: true,
//     },

//     items: [cartItemSchema],

//     isDeleted: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const Cart = mongoose.model("Cart", cartSchema);

// export default Cart;





import mongoose from "mongoose";


// ======================================================
// CART ITEM SCHEMA
// ======================================================

const cartItemSchema =
    new mongoose.Schema(
        {

            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },

            quantity: {
                type: Number,
                required: true,
                min: 1,
                default: 1
            },

            price: {
                type: Number,
                required: true,
                min: 0
            },

            originalPrice: {
                type: Number,
                default: 0,
                min: 0
            },

            discountAmount: {
                type: Number,
                default: 0,
                min: 0
            },

            finalPrice: {
                type: Number,
                required: true,
                min: 0
            }

        },

        {
            _id: true
        }
    );


// ======================================================
// CART SCHEMA
// ======================================================

const cartSchema =
    new mongoose.Schema(
        {

            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
                unique: true
            },

            items: {
                type: [cartItemSchema],
                default: []
            }

        },

        {
            timestamps: true
        }
    );


// ======================================================
// CALCULATE TOTALS
// ======================================================

cartSchema.virtual("subtotal").get(
    function () {

        return this.items.reduce(
            (total, item) => {

                const price =
                    Number(
                        item.finalPrice ??
                        item.price ??
                        0
                    );

                const quantity =
                    Number(
                        item.quantity || 0
                    );

                return (
                    total +
                    price * quantity
                );

            },

            0
        );
    }
);


// ======================================================
// JSON SETTINGS
// ======================================================

cartSchema.set(
    "toJSON",
    {
        virtuals: true
    }
);

cartSchema.set(
    "toObject",
    {
        virtuals: true
    }
);


// ======================================================
// EXPORT
// ======================================================

const Cart =
    mongoose.model(
        "Cart",
        cartSchema
    );


export default Cart;