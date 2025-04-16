const mangoose = require('mongoose')

const bookedSchema = new mangoose.Schema({
    customerName: {
        type: String,
        required: [true, "Customer name is required"],
        trim: true,
        minlength: [3, "Customer name must be at least 3 characters long"],
        maxlength: [50, "Customer name must be at most 50 characters long"]
    },
    phoneNumber: {
        type: String,
        required: [true, "Phone number is required"],
        match: [/^\d{10}$/, "Phone number must be a valid 10-digit number"]
    },
    projectId: { type: String, required: true },
    leadBy: { type: String, required: true },
    cpName: { type: String },
    flateName: { type: String }
})

const ProjectBooking = mangoose.model('ProjectBooking', bookedSchema)

module.exports = ProjectBooking