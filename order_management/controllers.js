const pool = require("./db");
const queries = require("./queries");
const axios = require("axios");

const getOrders = (req, res) => {
   pool.query(queries.getOrders, (error, result) => {
      if (!result.rows.length) {
         return res.status(404).send("No orders found in the database");
      }

      res.status(200).json(result.rows);
      //q: what does .json(result.rows) do ?
      //a: it sends the result.rows as a json object
   });
};

const getOrderById = async (req, res) => {
   try {
      const id = req.params.id;
      // parseInt converts a string to an integer
      const orderRes = await pool.query(queries.getOrderById, [id]);

      if (orderRes.rowCount === 0) {
         throw new Error("Order not found");
      }

      const orderProductRes = await pool.query(queries.getOrderProductsById, [
         id,
      ]);

      if (orderProductRes.rowCount === 0) {
         throw new Error("Order products not found");
      }

      const products = orderProductRes.rows.map((row) => ({
         productId: row.productid,
         quantity: row.quantity,
         unitPrice: row.unitprice,
         totalProductPrice: row.totalproductprice,
      }));

      const response = {
         order: orderRes.rows[0],
         products,
      };

      res.status(200).json(response);
   } catch (error) {
      res.status(500).send(error.message);
   }
};

const addOrder = async (req, res) => {
   const client = await pool.connect();
   try {
      await client.query("BEGIN"); // Start a transaction

      const { customerId, products, status } = req.body;

      //checking if the customer exists
      const userResponse = await axios.get(
         `http://localhost:3000/api/users/${customerId}`
      );

      if (!userResponse) {
         throw new Error("User not found");
      }

      // Set a default status to "inprogress" if no status is provided
      const orderStatus = status || "Inprogress";

      let totalAmount = 0;

      //add the order to the orderTable
      const orderRes = await client.query(queries.addOrder, [
         customerId,
         totalAmount,
         orderStatus,
      ]);

      if (orderRes.rowCount === 0) {
         throw new Error("Failed to insert the order");
      }

      const orderId = orderRes.rows[0].orderid;

      for (const product of products) {
         const { productId, quantity } = product;

         //checking if the product exists
         const productRes = await axios.get(
            `http://localhost:3002/api/products/${productId}`
         );
         if (productRes.status === 404) {
            throw new Error("Product not found");
         }

         const productData = productRes.data;

         // Check if the product quantity is enough
         if (productData.productQuantity < quantity) {
            throw new Error("Product quantity is not enough");
         }

         //calculate the total
         const totalProductPrice = productData.productPrice * quantity;

         const orderProductRes = await client.query(queries.addOrderProduct, [
            orderId,
            productId,
            quantity,
            productData.productPrice,
            totalProductPrice,
         ]);

         if (orderProductRes.rowCount === 0) {
            throw new Error("Failed to insert the order product");
         }

         //update the product quantity after the order
         await axios.patch(
            `http://localhost:3002/api/products/quantity/${productId}`,
            {
               productQuantity: productData.productQuantity - quantity,
            }
         );

         totalAmount += totalProductPrice;
      }

      // Update the totalAmount in the orders table
      const updateOrderRes = await client.query(
         queries.updateOrderTotalAmount,
         [totalAmount, orderId]
      );

      if (updateOrderRes.rowCount === 0) {
         throw new Error("Failed to update the total amount of the order");
      }

      await axios.patch(
         `http://localhost:3000/api/users/numOfOrders/${customerId}/increment`
      );

      // Commit the transaction
      await client.query("COMMIT");

      res.status(201).send({
         orderId,
         customerId,
         totalAmount,
         status: orderStatus,
      });
   } catch (error) {
      // Rollback the transaction on error
      await client.query("ROLLBACK");
      res.status(500).send(error.message);
   } finally {
      client.release();
   }
};

const deleteOrder = async (req, res) => {
   try {
      const id = parseInt(req.params.id);

      //retrieve the order from the database
      const getOrderResult = await new Promise((resolve, reject) => {
         pool.query(queries.getOrderById, [id], (error, result) => {
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

      const customerId = getOrderResult.rows[0].customerid;
      const productId = getOrderResult.rows[0].productid;
      const quantity = getOrderResult.rows[0].quantity;
      const orderStatus = getOrderResult.rows[0].status.toLowerCase();
      //if the order is completed, cannot delete it
      if (orderStatus === "completed") {
         return res.status(400).send("Cannot delete a completed order");
      }

      //get the product details from the products service
      const productRes = await axios.get(
         `http://localhost:3002/api/products/${productId}`
      );

      const productData = productRes.data;

      pool.query(queries.deleteOrdersById, [id], (error, result) => {
         if (error) {
            throw error;
         }
      });

      // Update the product quantity after the order
      await axios.patch(
         `http://localhost:3002/api/products/quantity/${productId}`,
         {
            productQuantity: productData.productQuantity + quantity,
         }
      );

      //update the number of orders of the customer
      await axios.patch(
         `http://localhost:3000/api/users/numOfOrders/${customerId}/decrement`
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

      //retrieve the order from the database
      const getOrderResult = await new Promise((resolve, reject) => {
         pool.query(queries.getOrderById, [id], (error, result) => {
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
      const productRes = await axios.get(
         `http://localhost:3002/api/products/${productId}`
      );

      const productData = productRes.data;

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
         queries.updateOrder,
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
