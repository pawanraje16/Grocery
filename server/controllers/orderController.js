

// Place Order COD : /api/order/cod

import Product from "../models/Product";

export const placeOrderCOD = async (req, res) => {
    try {
        const { userId, items, address } = req.body;
        if(!address || items.length === 0){
            return res.json({success: false, message: "Invalid data"})
        }

        // Calculate Amount Using Items
        let amount = await items.reduce(async (acc, items) => {
            const product = await Product.findById(item.product);
            return (await acc) + product.offerPrice * item.quantity;
        }, 0) 
        
        //Add Tax Charge (2%)
        amount += Math.floor(amount * 0.02);

        await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "COD",
        });

        return res.json({success: true, message: "Order Placed Successfully"})
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}