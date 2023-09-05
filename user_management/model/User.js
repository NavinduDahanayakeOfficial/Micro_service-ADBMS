import mongoose from "mongoose";

//*define user schema
const userSchema = new mongoose.Schema(
   {
      userId: {
         type: Number,
         required: true,
         unique: true,
      },
      name: {
         type: String,
         required: true,
      },
      email: {
         type: String,
         required: true,
         unique: true,
      },
      phoneNumber: {
         type: String,
         default: "",
      },
      address: {
         type: String,
         default: "",
      },
      numOfOrders: Number,
   },

);

const User = mongoose.model("User", userSchema);
export default User;
