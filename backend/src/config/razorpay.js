// config/razorpay.js
import Razorpay from 'razorpay';

const razorpayConfig = {
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
};

const razorpayInstance = new Razorpay({
  key_id: razorpayConfig.key_id,
  key_secret: razorpayConfig.key_secret,
});

export { razorpayInstance, razorpayConfig };