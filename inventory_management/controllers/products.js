import mysql from "mysql2";
// import dotenv from "dotenv";

// dotenv.config();

const db = mysql.createConnection({
   host: process.env.HOST,
   user: process.env.USER,
   password: process.env.PASSWORD,
   database: process.env.DATABASE_NAME,
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

//READ A SINGLE PRODUCT
export const getSingleProduct = (req, res) => {
   const productID = req.params.id;
   const q = "SELECT * FROM products WHERE productID = ?";
   db.query(q, [productID], (err, data) => {
      if (err) {
         console.log(err);
         return res.json(err);
      }
      return res.json(data[0]);
   });
};

//CREATE
export const addNewProduct = (req, res) => {
   db.query(
      "SELECT * FROM products WHERE productName = ?",
      [req.body.productName],
      (err, data) => {
         if (err) {
            console.log(err);
            return res
               .status(500)
               .json({ error: "An error occurred while checking the product" });
         }

         if (data.length > 0) {
            return res.status(400).json({ message: "Product already exists" });
         }

         const q =
            "INSERT INTO products( `productName`, `productCategory`, `productBrand`, `productPrice`, `productQuantity`) VALUES (?)";
         const values = [
            req.body.productName,
            req.body.productCategory,
            req.body.productBrand,
            req.body.productPrice,
            req.body.productQuantity,
         ];
         db.query(q, [values], (err, data) => {
            if (err) {
               return res.send(err);
            }
            return res.json(data);
         });
      }
   );
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
   const q =
      "UPDATE products SET `productName`= ?, `productCategory`= ?, `productBrand`= ?, `productPrice`= ?, `productQuantity`= ? WHERE productID = ?";
   const values = [
      req.body.productName,
      req.body.productCategory,
      req.body.productBrand,
      req.body.productPrice,
      req.body.productQuantity,
   ];
   db.query(q, [...values, productID], (err, data) => {
      if (err) {
         return res.send(err);
      }
      return res.json(data);
   });
};

//update quantity
export const updateQuantity = (req, res) => {
   const productID = req.params.id;
   const q = "UPDATE products SET `productQuantity`= ? WHERE productID = ?";
   const values = [req.body.productQuantity];
   db.query(q, [...values, productID], (err, data) => {
      if (err) {
         return res.send(err);
      }
      return res.json(data);
   });
};
