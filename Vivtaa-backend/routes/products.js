var express = require('express');
var router = express.Router();
const Products = require('../schema/product');
const { authenticateToken } = require('../middleware/jwt');
const multer = require('multer');
const path = require('path');
const { productSchema } = require('../validation/products');
const yup = require('yup');
const mongoose = require('mongoose');

// get all product
router.get('/products', authenticateToken, async (req, res) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNumber = Number(page);
        const pageSize = Number(limit);
        const skip = (pageNumber - 1) * pageSize;
        let searchQuery = {};
        // search
        if (search.trim()) {
            searchQuery = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                ],
            };
        }

        // Filter by user_id
        searchQuery.user_id = req.user.id;

        const [products, total] = await Promise.all([
            Products.find(searchQuery)
                .skip(skip)
                .limit(pageSize)
                .sort({ createdAt: -1 }),
            Products.countDocuments(searchQuery ? searchQuery : ''),
        ]);

        return res.status(200).json({
            status: 200,
            message: 'Product fetch successfully',
            data: products,
            pagination: {
                total,
                page: pageNumber,
                limit: pageSize,
                totalPages: Math.ceil(total / pageSize),
            },
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// get single product
router.get('/products/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Products.findById(id);

        if (!product) {
            return res.status(404).json({
                status: 404,
                message: 'Product not found',
            });
        }

        return res.status(200).json({
            status: 200,
            message: 'Product fetched successfully',
            data: product,
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Internal server error',
            error: error.message,
        });
    }
});


// product image upload
// multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        // console.log('files', file);
        cb(null, file.originalname.replace(path.extname(file.originalname), '-') + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limit file size to 5MB
    } // 5mb
});

router.post('/file-upload', authenticateToken, upload.array('files', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                status: 400,
                message: "No files uploaded"
            });
        }

        const filePath = req.files.map((files) => {
            return {
                filename: files.filename,
                path: `/uploads/${files.path}`
            }
        });

        return res.status(200).json({
            status: 201,
            message: `File uploaded successfully`,
            data: filePath
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// create a product
router.post('/add-product', authenticateToken, async (req, res) => {
    try {
        const getUserId = req.user.id;
        const bodyProducts = {...req.body, user_id:getUserId};

        await productSchema.validate(req.body, { abortEarly: false });

        //create product
        const createProduct = new Products(bodyProducts);
        await createProduct.save();

        return res.status(201).json({
            status: 201,
            message: 'Product add successfully',
            data: createProduct
        });
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            const errors = error.inner.map(error => ({
                path: error.path,
                message: error.message
            }));
            return res.status(400).json({
                status: 400,
                message: 'Validation Error',
                errors: errors
            });
        }

        return res.status(500).json({
            status: 500,
            message: 'Internal server error',
            error: error.message
        });
    }
});

//edit product
router.put('/edit-product/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid product id',
            });
        }

        const bodyProducts = { ...req.body };
        delete bodyProducts.product_id;        

        // Validate request body
        await productSchema.validate(bodyProducts, { abortEarly: false });

        // Check if product belongs to user
        const product = await Products.findById(id);
        if (!product) {
            return res.status(404).json({
                status: 404,
                message: 'Product not found',
            });
        }
        if (product.user_id.toString() !== req.user.id) {
            return res.status(403).json({
                status: 403,
                message: 'You are not authorized to edit this product',
            });
        }

        // Update product
        const updatedProduct = await Products.findByIdAndUpdate(
            id,
            bodyProducts,
            {
                new: true,        // return updated document
                runValidators: true,
            }
        );

        if (!updatedProduct) {
            return res.status(404).json({
                status: 404,
                message: 'Product not found',
            });
        }

        return res.status(200).json({
            status: 200,
            message: 'Product updated successfully',
            data: updatedProduct,
        });

    } catch (error) {
        if (error instanceof yup.ValidationError) {
            const errors = error.inner.map(err => ({
                path: err.path,
                message: err.message,
            }));

            return res.status(400).json({
                status: 400,
                message: 'Validation Error',
                errors,
            });
        }

        return res.status(500).json({
            status: 500,
            message: 'Internal server error',
            error: error.message,
        });
    }
});

module.exports = router;