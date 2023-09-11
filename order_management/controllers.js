const pool = require("./db");
const queries = require("./queries");
const axios = require("axios");

//get all orders
const getOrders = async (req, res) => {
   try {
      const result = await pool.query(queries.getOrders);

      if (!result.rows.length) {
         throw new Error("No orders found");
      }

      res.status(200).json(result.rows);
      // .json(result.rows) sends the result.rows as a JSON response
   } catch (error) {
      res.status(500).send(error.message);
   }
};

//get an order by id
const getOrderById = async (req, res) => {
   try {
      const orderId = req.params.id;

      const orderRes = await pool.query(queries.getOrderById, [orderId]);

      if (orderRes.rowCount === 0) {
         throw new Error("Order not found");
      }

      const orderProductRes = await pool.query(queries.getOrderProductsById, [
         orderId,
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

//add an order
const addOrder = async (req, res) => {
   const client = await pool.connect();
   try {
      await client.query("BEGIN"); // Start a transaction

      const { customerId, products, status } = req.body;

      // Validation: Check if the status is valid (add your validation logic here)
      if (!isValidStatus(status)) {
         throw new Error("Invalid order status");
      }

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

//delete an order
const deleteOrder = async (req, res) => {
   const client = await pool.connect();
   try {
      await client.query("BEGIN"); // Start a transaction

      const orderId = req.params.id;

      //retrieve the order from the database
      const orderRes = await client.query(queries.getOrderById, [orderId]);

      // Check if the order exists
      if (orderRes.rowCount === 0) {
         throw new Error("Order not found, nothing to delete");
      }

      const customerId = orderRes.rows[0].customerid;
      const orderStatus = orderRes.rows[0].status.toLowerCase();
      //if the order is completed, cannot delete it
      if (orderStatus === "completed") {
         throw new Error("Cannot delete a completed order");
      }

      const orderProductRes = await client.query(queries.getOrderProductsById, [
         orderId,
      ]);

      if (orderProductRes.rowCount === 0) {
         throw new Error("Order products not found");
      }

      for (const row of orderProductRes.rows) {
         const orderId = row.orderid;
         const productId = row.productid;
         const quantity = row.quantity;

         // Delete order products
         await client.query(queries.deleteOrderProductsById, [
            orderId,
            productId,
         ]);

         //get the product details from the products service
         const productRes = await axios.get(
            `http://localhost:3002/api/products/${productId}`
         );

         const productData = productRes.data;

         // Update the product quantity after the order
         await axios.patch(
            `http://localhost:3002/api/products/quantity/${productId}`,
            {
               productQuantity: productData.productQuantity + quantity,
            }
         );
      }

      // Delete the order
      await client.query(queries.deleteOrdersById, [orderId]);

      //update the number of orders of the customer
      await axios.patch(
         `http://localhost:3000/api/users/numOfOrders/${customerId}/decrement`
      );

      await client.query("COMMIT"); // Commit the transaction

      res.status(200).send("Order deleted successfully");
   } catch (error) {
      await client.query("ROLLBACK"); // Rollback the transaction on error
      res.status(500).send(error.message);
   } finally {
      client.release();
   }
};

//update order status
const updateOrderStatus = async (req, res) => {
   try {
      const orderId = req.params.id;
      const { status } = req.body;

      // Validation: Check if the status is valid (add your validation logic here)
      if (!isValidStatus(status)) {
         throw new Error("Invalid order status");
      }

      // Update the order status in the orders table
      const updateOrderRes = await pool.query(queries.updateOrderStatus, [
         status,
         orderId,
      ]);

      if (updateOrderRes.rowCount === 0) {
         throw new Error("Failed to update order status");
      }

      res.status(200).send({
         message: "Order status updated successfully",
         updatedStatus: status,
      });
   } catch (error) {
      res.status(500).send(error.message);
   }
};

const updateOrderProducts = async (req, res) => {
   const client = await pool.connect();

   try {
      const orderId = req.params.id;
      const { products } = req.body;

      await client.query("BEGIN"); // Start a transaction

      const orderRes = await client.query(queries.getOrderById, [orderId]);

      if (orderRes.rowCount === 0) {
         throw new Error("Order not found");
      }

      let totalAmount = orderRes.rows[0].totalamount;

      for (const product of products) {
         const { productId, quantity } = product;

         // Retrieve order product data from the database
         const orderProductRes = await client.query(
            queries.getOrderProductByOrderAndProduct,
            [orderId, productId]
         );

         if (orderProductRes.rowCount === 0) {
            throw new Error(
               `Order product not found for Order ${orderId} and Product ${productId}`
            );
         }

         const orderProductData = orderProductRes.rows[0];

         totalAmount -= orderProductData.totalproductprice;

         // Calculate the difference in quantity
         const originalQuantity = orderProductData.quantity;

         const newTotalProductPrice = orderProductData.unitprice * quantity;

         // Update the order product quantity
         const updateOrderProductRes = await client.query(
            queries.updateOrderProductQuantityAndPrice,
            [quantity, newTotalProductPrice, orderId, productId]
         );

         if (updateOrderProductRes.rowCount === 0) {
            throw new Error(
               `Failed to update order product for Order ${orderId} and Product ${productId}`
            );
         }

         // Retrieve product data from the products service
         const productRes = await axios.get(
            `http://localhost:3002/api/products/${productId}`
         );

         const productData = productRes.data;

         // Update the product quantity after the order product update
         await axios.patch(
            `http://localhost:3002/api/products/quantity/${productId}`,
            {
               productQuantity:
                  productData.productQuantity - quantity + originalQuantity,
            }
         );

         totalAmount += newTotalProductPrice;
      }

      // Update the totalAmount in the orders table
      const updateOrderRes = await client.query(
         queries.updateOrderTotalAmount,
         [totalAmount, orderId]
      );

      if (updateOrderRes.rowCount === 0) {
         throw new Error("Failed to update the total amount of the order");
      }

      // Commit the transaction
      await client.query("COMMIT");

      res.status(200).send("Order products updated successfully");
   } catch (error) {
      // Rollback the transaction on error
      await client.query("ROLLBACK");
      res.status(500).send(error.message);
   } finally {
      client.release();
   }
};

function isValidStatus(status) {
   const validStatuses = ["inprogress", "completed", "in progress"];
   return validStatuses.includes(status.toLowerCase());
}

module.exports = {
   getOrders,
   getOrderById,
   addOrder,
   deleteOrder,
   updateOrderStatus,
   updateOrderProducts,
};
