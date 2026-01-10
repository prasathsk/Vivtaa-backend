const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
    },
    product_id:{
        type:Number,
        unique: true,
        required:false
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        default: 0
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
    },
    images: {
        type: [String],
        required: false
    },
    star_rating: {
        type: Number,
        required: false
    },
    star_rate_value: {
        type: Number,
        required: false,
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        maxlength: [200, 'Product description must be less than or equal to 2000 characters']
    },
    offer_status: {
        type: Boolean,
        required: false,
    },
    offer_percentage: {
        type: Number,
        required: false,
    },
    offer_start_date: {
        type: Date,
        required: false,
    },
    offer_end_date: {
        type: Date,
        required: false,
    },
    delivery_days: {
        type: Number,
        required: false,
    }
});

const Products = mongoose.model('products', productSchema);

module.exports = Products;