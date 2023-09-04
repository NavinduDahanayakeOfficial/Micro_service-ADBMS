import express from "express";
import cors from "cors";
import productRoute from "./routes/products.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/products", productRoute);

app.listen(3002, () => {
  console.log("Server is running on port 3002.");
});