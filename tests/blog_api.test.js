const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const helper = require('./test_helper')
const bcrypt = require('bcryptjs')
const User = require('../models/user')

let loggedInToken = ' '
beforeEach(async ()=>{
    await User.deleteMany({})
    await Blog.deleteMany({})

    let blogObject = new Blog(helper.initialBlogs[0])
    await blogObject.save()
    blogObject = new Blog(helper.initialBlogs[1])
    await blogObject.save()

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(helper.initialUsers[0].password,salt)
    let user = new User({
        username: helper.initialUsers[0].username, 
        passwordHash,
        name: helper.initialUsers[0].name
    })
    await user.save()

    const creds = {
        username: helper.initialUsers[0].username,
        password: helper.initialUsers[0].password
    }
    const res = await api.post('/api/login').send(creds)
    loggedInToken = res.body.token   
})

test('blogs are returned as json', async () => {
    const response = await api
        .get('/api/blogs')
        .set('authorization', `bearer ${loggedInToken}`)

    expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('a blog has a unique identifier protery named id', async () => {
    const response = await api
        .get('/api/blogs')
        .set('authorization', `bearer ${loggedInToken}`)
    response.body.forEach(blog =>{
        expect(blog.id).toBeDefined()
    })
})

test('a blog is successfully created', async () => {
    const newBlog = {
        title: 'New Blog Post',
        url: 'somerandom@url.com',
        likes: 21
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .set('authorization', `bearer ${loggedInToken}`)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    const contents = blogsAtEnd.map(r => {
        return {
            title: r.title,
            author: r.author,
            url: r.url,
            likes: r.likes
        }
    })


    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
    expect(contents).toContainEqual({
        title: 'New Blog Post',
        author: 'Mendez',
        url: 'somerandom@url.com',
        likes: 21
    })
})

test('blog resquest has no likes property', async() =>{
    const newBlog = {
        title: 'New Blog Post 2',
        url: 'somerandom2@url.com'
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .set('authorization', `bearer ${loggedInToken}`)
        .expect(201)
        .expect('Content-Type', /application\/json/)


    const blogsAtEnd = await helper.blogsInDb()
    const contents = blogsAtEnd.map(r => {
        return {
            title: r.title,
            author: r.author,
            url: r.url,
            likes: r.likes
        }
    })

    expect(contents).toContainEqual({
        title: 'New Blog Post 2',
        author: 'Mendez',
        url: 'somerandom2@url.com',
        likes: 0
    })
  
})

test('blog request with missing title and url properties', async() =>{
    const newBlog = {
        likes: 50
    }

    await api
    .post('/api/blogs')
    .send(newBlog)
    .set('authorization', `bearer ${loggedInToken}`)
    .expect(400)
})


test('Adding a blog without a token', async ()=>{
    const newBlog = {
        title: "A blog without a token",
        url: "noBlog.com",
        likes: 150
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)
})

afterAll(() => {
    mongoose.connection.close()
})