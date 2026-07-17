const generateSKU = (category, brand, number) => {

    const cat = category
        .substring(0, 3)
        .toUpperCase();

    const br = brand
        .substring(0, 3)
        .toUpperCase();

    return `${cat}-${br}-${String(number).padStart(4, "0")}`;

};

export default generateSKU;