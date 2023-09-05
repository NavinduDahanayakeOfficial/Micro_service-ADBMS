const pool = require("./db");
const querries = require("./querries");
const axios = require("axios");

const getOrders = (req, res) => {
   pool.query(querries.getOrders, (error, result) => {
      if (!result.rows.length) {
         return res.status(404).send("No orders found in the database");
      }

      res.status(200).json(result.rows);
      //q: what does .json(result.rows) do ?
      //a: it sends the result.rows as a json object
   });
};

const getOrderById = (req, res) => {
   const id = parseInt(req.params.id);
   // parseInt converts a string to an integer
   pool.query(querries.getOrderById, [id], (error, result) => {
      const noOrder = !result.rows.length;
      if (noOrder) {
         return res
            .status(404)
            .send("Order with this id is not found in the database");
      }
      res.status(200).json(result.rows);
   });
};

const addOrder = async (req, res) => {
   try {
      const { customerId, productId, quantity, status } = req.body; //destructuring the request body
      //checking the email is already in the pool

      //checking if the customer exists
      const userResponse = await axios.get(
         `http://localhost:3000/api/users/${customerId}`
      );

      if (!userResponse) {
         return res.status(404).send("User not found");
      }

      //checking if the product exists
      const productResponse = await axios.get(
         `http://localhost:3002/api/products/${productId}`
      );
      if (productResponse.status === 404) {
         return res.status(404).send("Product not found");
      }

      const productData = productResponse.data;

      // Check if the product quantity is enough
      if (productData.productQuantity < quantity) {
         return res.status(404).send("Product quantity is not enough");
      }

      //update the product quantity after the order
      await axios.patch(
         `http://localhost:3002/api/products/quantity/${productId}`,
         {
            productQuantity: productData.productQuantity - quantity,
         }
      );

      // Set a default status to "inprogress" if no status is provided
      const orderStatus = status || "Inprogress";

      //calculate the total
      const unitPrice = productData.productPrice;
      let total = quantity * unitPrice;

      //add the order to the database
      pool.query(
         querries.addOrder,
         [customerId, productId, quantity, unitPrice, total, orderStatus],
         (error, results) => {
            if (error) {
               throw error;
            }
         }
      );
      await axios.patch(
         `http://localhost:3000/api/users/numOfOrders/${customerId}`
      );
      res.status(201).send("Order added successfully");
   } catch (error) {
      res.status(500).send(error.message);
   }
};

const deleteOrder = async (req, res) => {
   try {
      const id = parseInt(req.params.id);

      //retrieve the order from the database
      const getOrderResult = await new Promise((resolve, reject) => {
         pool.query(querries.getOrderById, [id], (error, result) => {
            if (error) {
               reject(error);
            } else {
               resolve(result);
            }
         });
      });

      // Check if the order exists
      if (getOrderResult.rows.length === 0) {
         return res
            .status(404)
            .send("Order with this id is not found in the database");
      }

      const productId = getOrderResult.rows[0].productid;
      const quantity = getOrderResult.rows[0].quantity;
      const orderStatus = getOrderResult.rows[0].status.toLowerCase();
      //if the order is completed, cannot delete it
      if (orderStatus === "completed") {
         return res.status(400).send("Cannot delete a completed order");
      }

      //get the product details from the products service
      const productResponse = await axios.get(
         `http://localhost:3002/api/products/${productId}`
      );

      const productData = productResponse.data;

      console.log(productData.productQuantity);

      pool.query(querries.deleteOrdersById, [id], (error, result) => {
         if (error) {
            throw error;
         }
      });

      // Update the product quantity after the order
      await axios.patch(
         `http://localhost:3002/api/products/quantity/${productId}`,
         {
            productQuantity:
               productData.productQuantity +  quantity,
         }
      );

      res.status(200).send("Order deleted successfully");
   } catch (error) {
      res.status(500).send(error.message);
   }
};

const updateOrder = async (req, res) => {
   try {
      const id = parseInt(req.params.id);
      const { quantity, status } = req.body;

      console.log(quantity, status);

      //retrieve the order from the database
      const getOrderResult = await new Promise((resolve, reject) => {
         pool.query(querries.getOrderById, [id], (error, result) => {
            if (error) {
               reject(error);
            } else {
               resolve(result);
            }
         });
      });

      // Check if the order exists
      if (getOrderResult.rows.length === 0) {
         return res
            .status(404)
            .send("Order with this id is not found in the database");
      }

      const oldQuantity = getOrderResult.rows[0].quantity;
      const orderStatus = getOrderResult.rows[0].status.toLowerCase();

      //if the order is completed, cannot update it
      if (orderStatus === "completed") {
         return res.status(400).send("Cannot update a completed order");
      }

      const productId = getOrderResult.rows[0].productid;

      //get the product details from the products service
      const productResponse = await axios.get(
         `http://localhost:3002/api/products/${productId}`
      );

      const productData = productResponse.data;

      console.log(productData.productQuantity);

      // Check if the product quantity is enough
      if (productData.productQuantity < quantity) {
         return res.status(400).send("Product quantity is not enough");
      }

      // Update the product quantity after the order
      await axios.patch(
         `http://localhost:3002/api/products/quantity/${productId}`,
         {
            productQuantity:
               productData.productQuantity + oldQuantity - quantity,
         }
      );

      //calculate the total
      const unitPrice = productData.productPrice;
      let total = quantity * unitPrice;

      // Update the order in the database
      pool.query(
         querries.updateOrder,
         [quantity, total, status, id],
         (error, result) => {
            if (error) {
               throw error;
            }
            res.status(200).send("Order updated successfully");
         }
      );
   } catch (error) {
      res.status(500).send(error.message);
   }
};

module.exports = {
   getOrders,
   getOrderById,
   addOrder,
   deleteOrder,
   updateOrder,
};
