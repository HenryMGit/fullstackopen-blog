const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
    {
        title: "Test Blog",
        author: "Henry Mendoza",
        url: "testing@testing.com"
    },
    {
        title: "Test Blog 2",
        author: "Erik Mendoza",
        url: "testing2@testing.com"
    },
]

const initialUsers = [
    {
        username: "McBlom",
        name: "Mendez",
        password: "Sekrteeed"
    },
    {
        username: "Faze4450",
        name: "Ricky",
        passowrd:"someRand123"
    }
]

const blogsInDb = async() =>{
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

const usersInDb = async() =>{
    const users = await User.find({})
    return users.map(user => user.toJSON())
}

module.exports ={
    initialBlogs,
    initialUsers,
    blogsInDb,
    usersInDb
}