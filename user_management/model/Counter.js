import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
    id: String,
    sequence_value: Number
})

const Counter = mongoose.model("Counter", counterSchema);
export default Counter;