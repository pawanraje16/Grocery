import { v2 as cloudinary } from "cloudinary"
import Product from "../models/Product.js"

// Add Product : /api/product/add
export const addProduct = async (req, res) => {
    try {
        console.log("Incoming request to add product");

        let productData = JSON.parse(req.body.productData);
        console.log("Parsed productData:", productData);

        const images = req.files;
        console.log("Uploaded images:", images);

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                const result = await cloudinary.uploader.upload(item.path, {
                    resource_type: 'image',
                });
                return result.secure_url;
            })
        );

        await Product.create({ ...productData, image: imagesUrl });

        res.json({ success: true, message: "Product Added" });
    } catch (error) {
        console.error("Error while adding product:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add the product data",
            error: error.message,
        });
    }
};

// Get Product: /api/product/list
export const productList =  async (req, res) => {
    try {
         const products =  await Product.find({})
         res.json({success: true, products})
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message + "fail to get the productlist"})
    }
}

// Get single Product : /api/product/id
export const productById = async (req, res) => {
    try {
        const { id } =req.body
        const product = await Product.findById(id)
        res.json({success: true, product})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// Change Product inStock : /api/product/stock
export const changeStock = async (req, res) => {
    try {
        const { id, inStock } = req.body
        await Product.findByIdAndUpdate(id, {inStock})
        res.json({success: true, message: "Stock Updated"})
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}