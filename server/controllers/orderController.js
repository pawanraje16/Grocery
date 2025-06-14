import { response } from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Stripe from "stripe";


// Place Order COD : /api/order/cod


export const placeOrderCOD = async (req, res) => {
    try {
        const { items, address } = req.body;
        const userId = req.userId;
        if(!address || items.length === 0){
            return res.json({success: false, message: "Invalid data"})
        }

        // Calculate Amount Using Items
        let amount = await items.reduce(async (acc, item) => {
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

// Place Order Stripe : /api/order/stripe
export const placeOrderStripe = async (req, res) => {
    try {
        console.log("we are in stripe online method")
        const { userId, items, address } = req.body;
        const { origin } =req.headers; // from where req is created


        if(!address || items.length === 0){
            return res.json({success: false, message: "Invalid data"})
        }

        let productData = [];

        // Calculate Amount Using Items
        let amount = await items.reduce(async (acc, item) => {
            const product = await Product.findById(item.product);
            productData.push({
                name: product.name,
                price: product.offerPrice,
                quantity: item.quantity,
            });
            return (await acc) + product.offerPrice * item.quantity;
        }, 0) 
        
        //Add Tax Charge (2%)
        amount += Math.floor(amount * 0.02);

        const order = await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "Online",
        });

        // Stripe Gateway Initialize
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

        //create line items for stripe
        const line_items = productData.map((item) => {
            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: Math.floor(item.price + item.price * 0.02) * 100
                },
                quantity: item.quantity,
            }
        })

        // create session
        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${origin}/loader?next=my-orders`,
            cancel_url: `${origin}/cart`,
            metadata: {
                orderId: order._id.toString(),
                userId,
            }
        })
        console.log("we returning the message of the stripe session")
        return res.json({success: true, url: session.url });
    } catch (error) {
        console.log(error.message+": we are in catch block of the online method in orderController")
        return res.json({ success: false, message: error.message});
    }
}

// Stripe Webhooks to Verify Payments Action : /stripe

export const stripeWebhooks = async (request, response) => {
    // Stripe Gateway Initialize 
    const stripeInstance = new stripe (process.env.STRIPE_SECRET_KEY);
    console.log("Created stripe Instance in stripeHooks function");
    const sig = request.headers["stripe-signature"];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            request.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
        console.log("we are try block of the stripehooks");
    } catch (error) {
        console.log("we are in the catch block of the stripehooks function in orderController having error: "+error.message)
        response.status(400).send(`Webhook Error: ${error.message}`)        
    }

    // Handle the event
   switch (event.type) {
    case "payment_intent.succeeded":{
         const paymentIntent = event.data.object;
         const paymentIntentId = paymentIntent.id;

         // Getting Session Metadata
         const session  = await stripeInstance.checkout.sessions.list({
            payment_intent: paymentIntentId,
         });

         const { orderId, userId } = session.data[0].metadata;
         // Mark Payment as Paid
         await Order.findByIdAndUpdate(orderId, {isPaid: true})
         // Clear user cart
         await User.findByIdAndUpdate(userId, {cartItem: {}});
         break;
        }
        case "payment_intent.payment_failed": {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            // Getting Session Metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            const { orderId } = session.data[0].metadata;
            await Order.findByIdAndDelete(orderId);
            break;
        } 
    default:
        console.error(`Unhandled event type ${event.type}`)
        break;
   }
   response.json({received: true});
}

// Get Orders by User ID : /api/order/user
export const getUserOrders = async (req, res) => {
    try {
        const  userId  = req.userId;
        console.log("Fetching orders for user:" , userId)
        const orders = await Order.find({
            userId,
            $or: [{paymentType: "COD"}, {isPaid: true}]
        }).populate("items.product address").sort({createdAt: -1});
        if(!orders || orders.length === 0){
            console.log("NO any order")
        }
        console.log("Succefully fetch the user order")
        res.json({ success: true, orders });
    } catch (error) {
        console.log("Error in getUserOrders:" , error.message);
        res.json({ success: false, message: error.message});
    }
}

// Get All Orders ( for seller / admin ) : /api/order/seller

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            $or: [{paymentType: "COD"}, {isPaid: true}]
        }).populate("items.product address").sort({createdAt: -1});
        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}