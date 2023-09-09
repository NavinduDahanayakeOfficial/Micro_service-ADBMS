const getOrders = "SELECT * FROM orders";
const getOrderById = "SELECT * FROM orders WHERE orderId = $1";
const getOrderProductsById = "SELECT * FROM order_products WHERE orderid = $1"
const addOrder =
   "INSERT INTO orders (customerId, totalAmount, status) VALUES ($1, $2, $3) RETURNING orderId";
const addOrderProduct =
   "INSERT INTO order_products (orderId, productId, quantity, unitPrice, totalProductPrice) VALUES ($1, $2, $3, $4, $5) ";
const updateOrderTotalAmount =
   "UPDATE orders SET totalAmount = $1 WHERE orderid = $2";
const deleteOrdersById = "DELETE FROM orders WHERE id = $1";
const updateOrder =
   "UPDATE orders SET quantity = $1, total = $2, status = $3 WHERE id = $4";

const getQuantity = "SELECT quantity FROM orders WHERE id = $1";

module.exports = {
   getOrders,
   getOrderById,
   getOrderProductsById,
   addOrder,
   addOrderProduct,
   updateOrderTotalAmount,
   deleteOrdersById,
   updateOrder,
   getQuantity,
};
