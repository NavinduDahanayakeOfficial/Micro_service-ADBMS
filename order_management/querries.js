const getOrders = "SELECT * FROM orders";
const getOrderById = "SELECT * FROM orders WHERE id = $1";
const addOrder =
  "INSERT INTO orders (customerId, productId, quantity, unitPrice, total, status) VALUES ($1, $2, $3, $4, $5, $6)";
const deleteOrdersById = "DELETE FROM orders WHERE id = $1";
const updateOrder =
  "UPDATE orders SET quantity = $1, total = $2, status = $3 WHERE id = $4";

const getQuantity = "SELECT quantity FROM orders WHERE id = $1";

module.exports = {
  getOrders,
  getOrderById,
  addOrder,
  deleteOrdersById,
  updateOrder,
  getQuantity,
};
