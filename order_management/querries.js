const getOrders = "SELECT * FROM orders";
const getOrderById = "SELECT * FROM orders WHERE id = $1";
const addOrder =
  "INSERT INTO orders (customerId, productId, quantity, unitPrice, total, status) VALUES ($1, $2, $3, $4, $5, $6)";
const deleteOrdersById = "DELETE FROM orders WHERE id = $1";
const updateOrder =
  "UPDATE orders SET quantity = $1, status = $2 WHERE id = $3";

module.exports = {
  getOrders,
  getOrderById,
  addOrder,
  deleteOrdersById,
  updateOrder,
};
