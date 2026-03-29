// services/razorpayService.js
class RazorpayService {
  constructor() {
    this.key = process.env.REACT_APP_RAZORPAY_KEY_ID;
    this.loadScript();
  }
  
  loadScript() {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }
  
  async initPayment(orderData, studentData, onSuccess, onError) {
    const scriptLoaded = await this.loadScript();
    
    if (!scriptLoaded) {
      onError('Failed to load Razorpay SDK');
      return;
    }
    
    const options = {
      key: this.key,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'Your Institute Name',
      description: 'Admission Fee Payment',
      image: '/logo.png',
      order_id: orderData.orderId,
      handler: (response) => {
        onSuccess(response);
      },
      prefill: {
        name: studentData.name,
        email: studentData.email,
        contact: studentData.phone
      },
      notes: {
        studentId: studentData.studentId,
        address: studentData.address
      },
      theme: {
        color: '#F37254'
      },
      modal: {
        ondismiss: () => {
          onError('Payment cancelled by user');
        }
      }
    };
    
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  }
}

export default new RazorpayService();