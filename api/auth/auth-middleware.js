const Users = require('../users/users-model')

const uniqueName = async (req, res, next) => {
    const {username} = req.body

    const existingName = await Users.findByUserName(username)
    existingName ? next({status: 401, message: '-username taken-'}) : next()
}

const validUsername = async (req, res, next) => {
    const {username} = req.body

    const validUser = await Users.findByUserName(username)
    if(validUser){
        req.user = validUser
        next()
    } else {
        next({status: 401, message: '-invalid credentials-'})
    }
}

const validInput = (req, res, next) => {
    const {username, password} = req.body

    if(!username || !password){
        next({status: 400, message: '-username and password required-'})
    } else {
        next()
    }
}

module.exports = {
    validInput,
    validUsername,
    uniqueName
}