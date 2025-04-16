const users = require('../models/userSchema')
const Cp = require('../models/cpSchema')
const Flats = require('../models/flateSchema')
const Project = require('../models/projectSchema');
const ProjectBooking = require('../models/bookedSchema')
const Booking = require('../models/bookedSchema')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')


exports.register = async (req, res) => {
    console.log('inside register controller');

    const { name, email, password } = req.body
    // console.log(name, email, password);

    try {
        const existUser = await users.findOne({ email })

        if (existUser) {
            res.status(406).json('User already exist. Please login')
        }
        else {
            // hash password
            const hashedPassword = await bcrypt.hash(password, 10)
            const newUser = new users({
                name,
                email,
                password: hashedPassword

            })
            await newUser.save()
            res.status(200).json(newUser)
        }
    } catch (error) {
        res.status(401).json(`Registration failed dew to ${error}`)
    }
}

exports.login = async (req, res) => {
    console.log('Inside login controller');

    const { email, password } = req.body;

    try {
        const existUser = await users.findOne({ email })
        if (!existUser) {
            return res.status(406).json('Incorrect email or password')
        }

        const isMatch = await bcrypt.compare(password, existUser.password)
        if (!isMatch) {
            return res.status(406).json('Incorrect email or password')
        }

        const token = jwt.sign({ userId: existUser._id }, "$ecret$uperAppkey12345")
        console.log('Token is', token);


        return res.status(200).json({ existUser, token })
    } catch (error) {
        return res.status(401).json(`Login failed due to ${error}`)
    }
}

exports.cpRegister = async (req, res) => {
    console.log('inside cpRegister controller');

    const { cpName, phn, email } = req.body
    console.log(cpName, phn, email);

    try {
        const existCp = await Cp.findOne({ email })

        if (existCp) {
            res.status(406).json('This CP is already registered')
        }
        else {
            const newCp = new Cp({
                cpName,
                phn,
                email

            })
            await newCp.save()
            res.status(200).json(newCp)
        }
    } catch (error) {
        res.status(401).json(`Registration failed dew to ${error}`)
    }
}

exports.getAllCps = async (req, res) => {
    try {
        const allCps = await Cp.find()
        res.status(200).json(allCps)
    } catch (err) {
        res.status(401).json(`Request failed due to ${err}`)
    }
}

exports.deleteACp = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("Deleting CP with ID:", id);

        const deletedCp = await Cp.findByIdAndDelete(id);

        if (!deletedCp) {
            return res.status(404).json({ message: "CP not found" });
        }

        res.status(200).json({ message: "CP deleted successfully" })
    } catch (error) {
        console.error("Error deleting CP:", error);
        res.status(500).json({ message: "Error deleting CP" });
    }
}

exports.updateACp = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        const updatedCp = await Cp.findByIdAndUpdate(id, updatedData, {
            new: true,
            runValidators: true
        })

        if (!updatedCp) {
            return res.status(404).json({ message: "CP not found" });
        }

        res.status(200).json({ message: "CP updated successfully", data: updatedCp });

    } catch (error) {
        console.error("Error updating CP:", error);
        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: "Validation failed", errors });
        }
        res.status(500).json({ message: "Error updating CP" });
    }
}

exports.getAllFlates = async (req, res) => {
    try {
        const allCps = await Flats.find({ status: true })
        res.status(200).json(allCps)
    } catch (err) {
        res.status(401).json(`Request failed due to ${err}`)
    }
}

exports.submitProject = async (req, res) => {
    console.log('inside submitProject controller');
    const { projectName, cityRegion, address, selectedCPs, selectedFlates } = req.body
    // console.log(projectName, cityRegion, address, selectedCPs, selectedFlates);

    try {
        const newProject = new Project({
            projectName,
            region: cityRegion,
            address,
            selectedCps: selectedCPs,
            selectedFlates: selectedFlates,
        })

        await newProject.save();

        // set status false in Flats collection
        await Flats.updateMany(
            { _id: { $in: selectedFlates } },
            { $set: { status: false } }
        )

        res.status(201).json({ message: "Project submitted successfully", project: newProject });
    } catch (error) {
        console.error("Error submitting project:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

exports.getAllProjects = async (req, res) => {
    console.log('Inside getAllProjects controller');

    try {
        const projects = await Project.find()

        // extract ids from all projects
        const cpIds = [...new Set(projects.flatMap(project => project.selectedCps))];
        const flatIds = [...new Set(projects.flatMap(project => project.selectedFlates))];

        // fetch cp and flate details
        const cpDetails = await Cp.find({ _id: { $in: cpIds } }, { _id: 1, cpName: 1 });
        const flatDetails = await Flats.find({ _id: { $in: flatIds } }, { _id: 1, flateName: 1 })

        // convert arrays to maps
        const cpMap = new Map(cpDetails.map(cp => [cp._id.toString(), cp.cpName]));
        const flatMap = new Map(flatDetails.map(flat => [flat._id.toString(), flat.flateName]))

        // merge project data with names
        const updatedProjects = projects.map(project => ({
            _id: project._id,
            projectName: project.projectName,
            region: project.region,
            address: project.address,
            projectStatus: project.projectStatus,
            selectedCps: project.selectedCps.map(id => ({
                id,
                name: cpMap.get(id.toString()) || "Unknown CP"
            })),
            selectedFlates: project.selectedFlates.map(id => ({
                id,
                name: flatMap.get(id.toString()) || "Unknown Flat"
            }))
        }))

        res.status(200).json(updatedProjects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ message: `Failed due to ${error.message}` })
    }
}

exports.updateProject = async (req, res) => {
    console.log("Inside updateProject controller");

    const { id } = req.params;
    const updateData = req.body;

    try {
        // create an object to hold update fields
        let updateFields = {
            projectName: updateData.projectName,
            region: updateData.cityRegion,
            address: updateData.address
        };

        // only update selectedCPs if it's not empty
        if (updateData.selectedCPs && updateData.selectedCPs.length > 0) {
            updateFields.selectedCps = updateData.selectedCPs;
        }

        // only update selectedFlates if it's not empty
        if (updateData.selectedFlates && updateData.selectedFlates.length > 0) {
            updateFields.selectedFlates = updateData.selectedFlates;
            const project = await Project.findById(id)
            console.log('Projects are:', project.selectedFlates);
            //set status true of the flates that alredy in it
            await Flats.updateMany(
                { _id: { $in: project.selectedFlates } },
                { $set: { status: true } }
            )
            // set status to false that newely comes
            await Flats.updateMany(
                { _id: { $in: updateData.selectedFlates } },
                { $set: { status: false } }
            )
            //set project status true it includes flates
            await Project.findByIdAndUpdate(
                id,
                { projectStatus: true }
            )
        }

        // find the project by ID and update with valid fields only
        const updatedProject = await Project.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!updatedProject) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.status(200).json({ message: "Project updated successfully", updatedProject });
    } catch (error) {
        console.error("Error updating project:", error);
        res.status(500).json({ message: "Internal server error", error })
    }
}

exports.getProjectDetails = async (req, res) => {
    try {
        const { projectId } = req.params
        console.log("Project id:", projectId);

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" })
        }

        // fetch CPs with ID and Name
        const selectedCpData = await Cp.find(
            { _id: { $in: project.selectedCps } },
            '_id cpName'
        )

        // fetch Flats with id and name
        const selectedFlateData = await Flats.find(
            { _id: { $in: project.selectedFlates } },
            '_id flateName'
        )

        // format data to include both id and name
        const cpDetails = selectedCpData.map(cp => ({
            id: cp._id,
            name: cp.cpName
        }))

        const flateDetails = selectedFlateData.map(flate => ({
            id: flate._id,
            name: flate.flateName
        }))

        const responseData = {
            ...project._doc,
            cpDetails,
            flateDetails
        }

        res.status(200).json(responseData)
    } catch (error) {
        console.error("Error fetching project details:", error);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

exports.submitProjectBooking = async (req, res) => {
    try {
        const bookingData = req.body;

        const project = await Project.findById(bookingData.projectId)
        if (!project) {
            return res.status(404).json({ message: "Project not found" })
        }

        // remove the booked flat from selectedFlates
        project.selectedFlates = project.selectedFlates.filter(
            (flateId) => flateId.toString() !== bookingData.flateName.toString()
        )

        // update project status based on selectedFlates array
        project.projectStatus = project.selectedFlates.length === 0 ? false : true;

        await project.save()

        // save the booking data
        const newBooking = new ProjectBooking(bookingData)
        await newBooking.save()

        res.status(201).json({ message: "Project booked successfully", booking: newBooking })
    } catch (error) {
        console.error("Error booking project:", error);
        res.status(500).json({ message: "Server error", error });
    }
}

exports.deleteAproject = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ message: "Project not found" })
        }

        console.log("Selected Flats:", project.selectedFlates);

        // update the status of each flat in the Flats collection
        await Flats.updateMany(
            { _id: { $in: project.selectedFlates } },
            { $set: { status: true } }
        )

        // delete the project
        await Project.findByIdAndDelete(id);

        res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
        console.error("Error deleting project:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.getAllBookings = async (req, res) => {
    console.log('Inside getAllBookings controller');

    try {
        const allBookings = await Booking.find();

        // extract ids for CPs, Flats, and Projects
        const cpIds = [...new Set(allBookings.map(booking => booking.cpName).filter(Boolean))] // the cpids are null in some case
        const flateIds = allBookings.map(booking => booking.flateName)
        const projectIds = allBookings.map(booking => booking.projectId)

        // fetch details from respective collections
        const cpDetails = cpIds.length ? await Cp.find({ _id: { $in: cpIds } }, 'cpName') : [];
        const flateDetails = await Flats.find({ _id: { $in: flateIds } }, 'flateName');
        const projectDetails = await Project.find({ _id: { $in: projectIds } }, 'projectName');

        // convert fetched data into maps for quick lookup
        const cpMap = cpDetails.reduce((acc, cp) => {
            acc[cp._id.toString()] = cp.cpName;
            return acc;
        }, {});

        const flateMap = flateDetails.reduce((acc, flate) => {
            acc[flate._id.toString()] = flate.flateName;
            return acc;
        }, {});

        const projectMap = projectDetails.reduce((acc, project) => {
            acc[project._id.toString()] = project.projectName;
            return acc;
        }, {});

        // attach real names to the bookings
        const enrichedBookings = allBookings.map(booking => ({
            ...booking._doc,
            projectName: projectMap[booking.projectId],
            cpName: cpMap[booking.cpName] || "No CP Assigned",
            flateName: flateMap[booking.flateName]
        }))

        // console.log(enrichedBookings);
        res.status(200).json(enrichedBookings)
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ message: "Server error", error })
    }
}
