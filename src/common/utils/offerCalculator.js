export const calculateDiscountedPrice = (price, offer) => {

    if(!offer) return price;

    let discount = 0;

    if(offer.discountType === "PERCENTAGE"){
        discount = (price * offer.discountValue) / 100;
    } else {
        discount = offer.discountValue;
    }

    const final = price - discount;

    return final > 0 ? Math.round(final) : 0;
};


export const matchOfferToProduct = (product, offers) => {

    return offers.find((offer) => {

        const inProducts = offer.products
            ?.some((p) => p.toString() === product._id.toString());

        const inCategory = offer.categories
            ?.some((c) => c.toString() === product.category.toString());

        return inProducts || inCategory;

    }) || null;

};