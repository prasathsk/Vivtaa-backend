const yup = require('yup');

const productSchema = yup.object({
    name: yup.string().required('Product name is required'),
    product_id: yup.number().optional(),
    price: yup.number().required('Product price is required').min(0, 'Price must be a positive number'),
    category: yup.string().required('Product category is required'),
    images: yup.array().optional(),
   star_rating: yup
        .number()
        .required('Star rating is required')
        .test('is-number', 'Star rating must be a number', value => typeof value === 'number')
        .min(1, 'Star rating must be between 1 and 5')
        .max(5, 'Star rating must be between 1 and 5'),
    star_rate_value: yup.number().optional().min(0),
    description: yup.string().max(2000, 'Description must be less than 2000 characters').required('Product description is required'),
    offer_status: yup.boolean().optional(),
    offer_percentage: yup.number().optional().min(0).max(100),
    offer_start_date: yup.date().optional(),
    offer_end_date: yup.date().optional(),
    delivery_days: yup.number().optional().min(1, 'Delivery days must be at least 1'),
});

module.exports = { productSchema }