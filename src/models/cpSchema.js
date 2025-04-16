const mongoose = require('mongoose');

const cpSchema = new mongoose.Schema({
    cpName: {
        type: String,
        required: [true, "CP Name is required"],
        trim: true,
        minlength: [3, "CP Name must be at least 3 characters long"],
        maxlength: [50, "CP Name cannot exceed 50 characters"]
    },
    phn: {
        type: String,
        required: [true, "Phone number is required"],
        validate: {
            validator: function (value) {
                return /^\d{10}$/.test(value);
            },
            message: "Phone number must be a valid 10-digit number"
        }
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (value) {
                return /^\S+@\S+\.\S+$/.test(value);
            },
            message: "Enter a valid email address"
        }
    }
});

const allcps = mongoose.model('allcps', cpSchema);

module.exports = allcps;
