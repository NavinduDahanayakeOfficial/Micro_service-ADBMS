const express = require("express");
const dotenv = require("dotenv");
const orderRoutes = require("./routes");

dotenv.config();
const app = express();

app.use(express.json());

const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Hello from orders");
});

app.use("/api/orders", orderRoutes);

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
