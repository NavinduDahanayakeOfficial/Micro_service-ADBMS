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
      console.log(productResponse.data.quantity);
      if (!productResponse.quantity >= quantity) {
         return res.status(404).send("Product quantity is not enough");
      }
      console.log(productResponse.data.productPrice);
      const unitPrice = productResponse.productPrice;

      // Set a default status to "inprogress" if no status is provided
      const orderStatus = status || "Inprogress";

      const total = quantity * unitPrice;

      pool.query(
         querries.addOrder,
         [customerId, productId, quantity, unitPrice, total, orderStatus],
         (error, results) => {
            if (error) {
               throw error;
            }
            res.status(201).send("Order added successfully");
         }
      );
   } catch (error) {
      res.status(500).send(error.message);
   }
};



const deleteOrder = (req, res) => {
   const id = parseInt(req.params.id);

   pool.query(querries.deleteOrdersById, [id], (error, result) => {
      if (error) {
         throw error;
      }

      if (result.rowCount === 0) {
         res.status(404).send("Order not found in the database");
      } else {
         res.status(200).send("Order deleted successfully");
      }
   });
};



const updateOrder = (req, res) => {
   const id = parseInt(req.params.id);

   const { quantity, status } = req.body;

   pool.query(querries.getOrderById, [id], (error, result) => {
      const noOrder = !result.rows.length;
      if (noOrder) {
         return res
            .status(404)
            .send("Order with this id is not found in the database");
      }

      pool.query(querries.getQuantity, [id], (error, result) => {
         if (result.rows[0].quantity >= quantity) {
            return res.status(404).send("Product quantity is not enough");
         }

         pool.query(
            querries.updateOrder,
            [quantity, status, id],
            (error, result) => {
               if (error) {
                  throw error;
               }
               res.status(200).send("Order updated successfully");
            }
         );
      });
   });
};

module.exports = {
   getOrders,
   getOrderById,
   addOrder,
   deleteOrder,
   updateOrder,
};
