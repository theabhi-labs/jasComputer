// src/config/razorpay.js
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export const initRazorpayPayment = async (options) => {
  await loadRazorpayScript()
  
  return new Promise((resolve, reject) => {
    const razorpay = new window.Razorpay({
      key: process.env.REACT_APP_RAZORPAY_KEY_ID,
      ...options,
      handler: (response) => {
        resolve(response)
      },
      modal: {
        ondismiss: () => {
          reject(new Error('Payment cancelled by user'))
        }
      }
    })
    
    razorpay.open()
  })
}

export default { loadRazorpayScript, initRazorpayPayment }