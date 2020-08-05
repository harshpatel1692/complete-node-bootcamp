//Only requires file name to import the function
module.exports = (temp, product) => {
    let output  = temp.replace(/{%PRODUCTNAME%}/g, product.productName);
    output  = output.replace(/{%ID%}/g, product.id);
    output  = output.replace(/{%IMAGE%}/g, product.image);
    output  = output.replace(/{%QUANTITY%}/g, product.quantity);
    output  = output.replace(/{%PRICE%}/g, product.price);
    output  = output.replace(/{%FROM%}/g, product.from);
    output  = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
    output  = output.replace(/{%DESCRIPTION%}/g, product.description);

    if (!product.organic) output  = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic'); //css class name
    return output
};