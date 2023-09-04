import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
// import cors from "cors";

import userRoutes from "./routes/user.js";


//*configuration
const app = express();

app.use(express.json());
// app.use(cors());
dotenv.config();

//*routes
app.use("/api/users", userRoutes);


//*mongoose setup
const PORT = process.env.PORT || 3000;
mongoose
   .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
   })
   .then(() => {
      app.listen(PORT, () => {
         console.log(`Server is running on port ${PORT}`);
      });
   })
   .catch((error) => {
      console.log(error.message);
   });
