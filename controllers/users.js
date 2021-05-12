const bcrypt = require('bcryptjs')
const usersRouter = require('express').Router()
const User = require('../models/user')
const blogsRouter = require('./blogs')


usersRouter.post('/', async (req, res) => {
    const body = req.body

    if(!body.password)
        return res.status(400).json({'error': 'User validation failed: Password Missing'})

    if(body.password.length < 3)
        return res.status(400).json({'error': 'User validation failed: minlength less than 3'})

    const saltRounds = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(body.password, saltRounds)
    const user = new User({
        username: body.username,
        passwordHash,
        name: body.name
    })
    const savedUser = await user.save()
    res.status(201).json(savedUser)
})

usersRouter.get('/', async(req,res)=>{
    const users = await User.find({}).populate('blogs',{url:1,title:1,author:1})
    res.json(users)
})

module.exports = usersRouter