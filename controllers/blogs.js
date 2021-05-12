const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (req,res) => {
    const blogs = await Blog.find({}).populate('user',{username:1, name:1})
    res.json(blogs)
})

blogsRouter.post('/', async (req,res) => {
    if(!req.token || !req.user._id)
        return res.status(401).json({error: 'token missing or invalid'})

    const body = req.body
    const user = req.user
    const blog = new Blog({
        title: body.title,
        author: user.name,
        url: body.url,
        likes: body.likes? body.likes : 0,
        user: user._id
    })

    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id) 
    user.save()
    res.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (req,res)=>{
    const user = req.user
    if(user === null)
        return res.status(400).json({error: 'invalid user'})
    const blog = await Blog.findById(req.params.id)
    if(blog.user.toString() === user.id.toString()){
        await Blog.findByIdAndDelete(req.params.id)
        res.status(204).end()
    }
    else{
        return res.status(401).json({error: 'Unauthorized'})
    }
})

blogsRouter.put('/:id', async (req,res)=>{
    const body = req.body
    const blog = {
        likes: body.likes
    }
    
    await  Blog.findByIdAndUpdate(req.params.id, blog,{new:true, runValidators:true})
    res.json(updateBlog)
})


module.exports = blogsRouter