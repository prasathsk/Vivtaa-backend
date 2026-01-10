const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'password is required'],
        // minlength: [8, 'Password must be at least 8 characters'],
        // maxlength: [16, 'Password must be less than or equal to 16 characters'],
        validate: {
            validator: function (v) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/.test(v);
            },
            message: 'Password must contain at least one uppercase letter, one lowercase letter, one special character, one number, and be between 8 and 16 characters long.'
        }
    }
}, { timestamps: true });

// userSchema.pre('save', async function (next) {
//     try {
//         if (this.isModified('password')) {
//             this.password = await bcrypt.hash(this.password, 10); // Hash the password
//         }
//         next(); // Call next() to proceed with saving
//     } catch (error) {
//         next(error); // Pass the error to the next middleware
//     }
// });

const User = mongoose.model('users', userSchema);
module.exports = User;