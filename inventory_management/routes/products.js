import express, { Router } from "express";
import{
    getAllProduct,
    addNewProduct,
    deleteProduct,
    updateProductDetails,
    getSingleProduct,
    updateQuantity,
} from "../controllers/products.js";

const router = express.Router();

//CREATE
router.post("/", addNewProduct);

//READ
router.get("/", getAllProduct);

//UPDATE
router.put("/:id", updateProductDetails);
router.patch("/quantity/:id", updateQuantity);

//DELETE
router.delete("/:id", deleteProduct);

//READ SINGLE PRODUCT
router.get("/:id", getSingleProduct);

export default router;