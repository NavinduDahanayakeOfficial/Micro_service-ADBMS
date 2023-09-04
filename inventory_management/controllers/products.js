import mysql from "mysql2";

const db = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "Mysql@008701",
    database: "products",
  });  

//READ
export const getAllProduct = (req, res) => {
    const q = "SELECT * FROM products";
    db.query(q, (err, data) => {
        if (err) {
            console.log(err);
            return res.json(err);
        }
        return res.json(data);
    });
};

//CREATE
export const addNewProduct = (req, res) => {
    const q = "INSERT INTO products(`productID`, `productName`, `productCategory`, `productBrand`, `productPrice`, `productQuantity`) VALUES (?)";
    const values = [
        req.body.productID,
        req.body.productName,
        req.body.productCategory,
        req.body.productBrand,
        req.body.productPrice,
        req.body.productQuantity,
    ];
    db.query(q, [values], (err, data) => {
        if (err){ 
            return res.send(err);
        }
        return res.json(data);
    });
};

//DELETE
export const deleteProduct = (req, res) => {
    const productID = req.params.id;
    const q = " DELETE FROM products WHERE productID = ? ";
    db.query(q, [productID], (err, data) => {
        if (err) {
            return res.send(err);
        }
        return res.json(data);
    });
};

//UPDATE
export const updateProductDetails = (req, res) => {
    const productID = req.params.id;
    const q = "UPDATE products SET `productName`= ?, `productCategory`= ?, `productBrand`= ?, `productPrice`= ?, `productQuantity`= ? WHERE productID = ?";
    const values = [
        req.body.productName,
        req.body.productCategory,
        req.body.productBrand,
        req.body.productPrice,
        req.body.productQuantity,
    ];
    db.query(q, [...values,productID], (err, data) => {
        if (err) {
            return res.send(err);
        }
        return res.json(data);
    });
};

//READ A SINGLE PRODUCT
export const getSingleProduct = (req, res) => {
    const productID = req.params.id;
    const q = "SELECT * FROM products WHERE productID = ?";
    db.query(q, [productID], (err, data) => {
        if (err) {
            console.log(err);
            return res.json(err);
        }
        return res.json(data);
    });
};