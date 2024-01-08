const paypal = require('paypal-rest-sdk');

// Configure PayPal with your credentials
paypal.configure({
    mode: 'sandbox', // Change to 'live' for production
    client_id: 'AfwKBRZxphvlzfg3hN9w-JdIcUQZYArrhjeU0xtuAdt9gZBrQHml__vsJrCJLUrWjK61HPEzlxMbb5FY',
    client_secret: 'EJEjplmZl1vq7WbipSIx0J-eKebF0nnBPLOLXbV0_h2w6wKYQZqx2s9ndr0LmSeagzn7LLgk5WAslz6X',
});

// Set up a payment
const createPayment = async (amount, customerId, vendorId, scheduleId) => {
    const create_payment_json = {
        intent: 'sale',
        payer: {
            payment_method: 'paypal',
        },
        redirect_urls: {
            return_url: 'http://localhost:5000/success',
            cancel_url: 'http://localhost:5000/cancel',
        },
        transactions: [
            {
                item_list: {
                    items: [
                        {
                            name: 'Item Name',
                            sku: '001',
                            price: amount.toFixed(2),
                            currency: 'USD',
                            quantity: 1,
                        },
                    ],
                },
                amount: {
                    currency: 'USD',
                    total: amount.toFixed(2),
                },
                description: 'Description of the payment amount.',
                custom: JSON.stringify({ customerId, vendorId, scheduleId, amount }),
            },
        ],
    };

    return new Promise((resolve, reject) => {
        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                reject(error);
            } else {
                resolve(payment);
            }
        });
    });
};

const executePayment = async (paymentId, payerId) => {
    const execute_payment_json = {
        payer_id: payerId,
    };

    return new Promise((resolve, reject) => {
        paypal.payment.execute(paymentId, execute_payment_json, function (
            error,
            payment
        ) {
            if (error) {
                reject(error);
            } else {
                resolve(payment);
            }
        });
    });
};

module.exports = { createPayment, executePayment };
