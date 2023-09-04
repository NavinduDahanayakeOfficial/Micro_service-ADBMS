import mongoose from "mongoose";

//*define address schema
const addressSchema = new mongoose.Schema({
   buildingNo: String,
   street: String,
   city: String,
   postalCode: String,
   country: String,
});

//*define user schema
const userSchema = new mongoose.Schema({
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
      type: addressSchema,
      default: {},
   },
});

const User = mongoose.model("User", userSchema);
export default User;
