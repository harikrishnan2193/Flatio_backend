const express = require('express')
const userController = require('../controllers/userController')

const router = express.Router()

//register 
router.post('/users/register', userController.register)

//login
router.post('/users/login', userController.login)

//add new cp
router.post('/cp/addnew', userController.cpRegister)

//get all cps
router.get('/cps/all-cps', userController.getAllCps)

//delete a cp
router.delete('/cp/delete/:id', userController.deleteACp)

//updata a cp
router.put("/cp/update/:id", userController.updateACp)

//get all cps
router.get('/flates/all-flates', userController.getAllFlates)

//post new project
router.post('/form/alldatas', userController.submitProject);

//get all project
router.get('/selected/projects', userController.getAllProjects)

//update a project
router.put('/projects/:id', userController.updateProject)

//get selected project detils
router.get('/api/projects/:projectId', userController.getProjectDetails)

// post project booking details
router.post('/form/booked', userController.submitProjectBooking)

//delete a project
router.delete('/project/delete/:id', userController.deleteAproject)

//get all bokkins
router.get('/booking/all-bookings', userController.getAllBookings)


module.exports = router