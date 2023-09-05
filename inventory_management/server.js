import express from "express";
import cors from "cors";
import productRoute from "./routes/products.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/products", productRoute);

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});