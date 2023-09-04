const { Router } = require("express");
const controllers = require("./controllers");

const router = Router();

router.get("/", controllers.getOrders);
router.get("/:id", controllers.getOrderById);
router.post("/", controllers.addOrder);
router.delete("/:id", controllers.deleteOrder);
router.put("/:id", controllers.updateOrder);

module.exports = router;
