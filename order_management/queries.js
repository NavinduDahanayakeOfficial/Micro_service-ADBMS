const getOrders = "SELECT * FROM orders";
const getOrderById = "SELECT * FROM orders WHERE orderId = $1";
const getOrderProductsById = "SELECT * FROM order_products WHERE orderid = $1";
const getOrderProductByOrderAndProduct = "SELECT * FROM order_products WHERE orderid = $1 AND productid = $2";


const addOrder =
   "INSERT INTO orders (customerId, totalAmount, status) VALUES ($1, $2, $3) RETURNING orderId";
const addOrderProduct =
   "INSERT INTO order_products (orderId, productId, quantity, unitPrice, totalProductPrice) VALUES ($1, $2, $3, $4, $5) ";

   const deleteOrdersById = "DELETE FROM orders WHERE orderid = $1";
   const deleteOrderProductsById = "DELETE FROM order_products WHERE orderid = $1 AND productid = $2";

   const updateOrderTotalAmount = "UPDATE orders SET totalAmount = $1 WHERE orderid = $2";
   const updateOrderStatus = "UPDATE orders SET status = $1 WHERE orderid = $2";
   const updateOrderProductQuantityAndPrice = "UPDATE order_products SET quantity = $1, totalproductprice=$2 WHERE orderid = $3 AND productid = $4";

   // const getQuantity = "SELECT quantity FROM orders WHERE id = $1";

module.exports = {
   getOrders,
   getOrderById,
   getOrderProductsById,
   getOrderProductByOrderAndProduct,
   addOrder,
   addOrderProduct,
   updateOrderTotalAmount,
   deleteOrdersById,
   deleteOrderProductsById,
   updateOrderStatus,
   updateOrderProductQuantityAndPrice,
};
