
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
            },
              appliedOffer: {
            offerId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Offer",
                default: null
            },
            title: {
                type: String,
                default: ""
            },
            discountType: {
                type: String,
                default: ""
            },
            discountValue: {
                type: Number,
                default: 0
            }
        },

        },
            // ================================
        // OFFER SNAPSHOT (NEW)
        // ================================
      

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