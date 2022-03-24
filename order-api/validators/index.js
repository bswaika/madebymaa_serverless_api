const Joi = require('joi');

const orderCreateSchema = Joi.object({
    sellerID: Joi.string().required(),
    bill: Joi.object({
        items: Joi.array().items(Joi.object({
            dishID: Joi.string().required(),
            name: Joi.string().required(),
            quantity: Joi.number().required(),
            price: Joi.number().required(),
            amount: Joi.number().required()
        })),
        total: Joi.number().required(),
        deliveryCharge: Joi.number().required(),
        tax: Joi.object({
            sgst: Joi.number().required(),
            cgst: Joi.number().required()
        }),
        net: Joi.number().required()
    })
});

const orderValidateSchema = Joi.object({
    razorpay_payment_id: Joi.string().required(),
    razorpay_order_id: Joi.string().required(),
    razorpay_signature: Joi.string().required()
});

module.exports = {
    orderCreateSchema,
    orderValidateSchema
}