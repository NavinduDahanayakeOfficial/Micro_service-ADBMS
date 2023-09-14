const { Router } = require("express");
const controllers = require("./controllers");

const router = Router();

router.get("/", controllers.getOrders);
router.get("/:id", controllers.getOrderById);
router.post("/", controllers.addOrder);
router.delete("/:id", controllers.deleteOrder);
router.patch("/orderStatus/:id", controllers.updateOrderStatus);
router.patch("/orderQuantity/:id", controllers.updateOrderProducts);

module.exports = router;
