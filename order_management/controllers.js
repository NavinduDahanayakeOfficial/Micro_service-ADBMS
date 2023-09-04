const pool = require("../orders/db");
const querries = require("./querries");

const getOrders = (req, res) => {
   pool.query(querries.getOrders, (error, result) => {
      if (error) {
         throw error;
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
      if (error) {
         throw error;
      }
      res.status(200).json(result.rows);
   });
};

const addOrder = (req, res) => {
   const { customerId, productId, quantity, unitPrice, total, status } =
      req.body; //destructuring the request body
   //checking the email is already in the pool
   pool.query(
      querries.addOrder,
      [customerId, productId, quantity, unitPrice, total, status],
      (error, results) => {
         if (error) {
            throw error;
         }
         res.status(201).send("Order added successfully");
      }
   );
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
      //q: why do we put a ! in front of result.rows.length ?
      //a: because if the result.rows.length is 0, then !0 = true
      if (noOrder) {
         res.status(404).send(
            "Order with this id is not found in the database"
         );
         return;
      }
      pool.query(
         querries.updateOrder,
         [ quantity, status, id],
         (error, result) => {
            if (error) {
               throw error;
            }
            res.status(200).send("Order updated successfully");
         }
      );
   });
};

module.exports = {
   getOrders,
   getOrderById,
   addOrder,
   deleteOrder,
   updateOrder,
};
