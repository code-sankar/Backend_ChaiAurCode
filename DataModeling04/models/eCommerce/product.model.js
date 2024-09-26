import mongoose from "mongoose";
const productSchema = new mongoose.Schema(
  {
    descryption: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    productImage: {
      type: String,
    },
    price: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      default: 0,
    },
    categry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    owner:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      
    }
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
