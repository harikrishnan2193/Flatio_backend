const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    projectName: {
        type: String,
        required: true
    },
    region: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    selectedCps: {
        type: [String],
        required: true
    },
    selectedFlates: {
        type: [String],
        required: true
    },
    projectStatus: {
        type: Boolean,
        default: true
    }
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
