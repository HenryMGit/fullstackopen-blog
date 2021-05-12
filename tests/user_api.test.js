const bcrypt = require('bcryptjs')
const User = require('../models/user')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')

beforeEach(async() =>{
    await User.deleteMany({})
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(helper.initialUsers[0].password,salt)
    const passwordHash2 = await bcrypt.hash(helper.initialUsers[1].passowrd, salt)
    let user = new User({...helper.initialUsers[0], passwordHash:passwordHash})
    await user.save()
    user = new User({...helper.initialUsers[1], passwordHash:passwordHash2})
    await user.save()

})

test('A valid user is created successfully', async () =>{
    const newUser ={
        username: "Chow",
        name: "Erik",
        password: "pass123"
    }

    await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(helper.initialUsers.length + 1)
})

test('Invalid user with no password', async () =>{
    const newUser = {
        username: "NumBee",
        name: "Walzo"
    }
    const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)

    const usersAtEnd = await helper.usersInDb()
    expect(response.body.error).toBe('User validation failed: Password Missing')
    expect(usersAtEnd).toHaveLength(helper.initialUsers.length)

})

test('Invalid user with no username', async () =>{
    const newUser = {
        name: "Walzo",
        password:"Chachi"
    }
    
    const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)

    const usersAtEnd = await helper.usersInDb()
    expect(response.body.error).toContain('User validation')
    expect(usersAtEnd).toHaveLength(helper.initialUsers.length)

})

test('Invlaid user with password less than 3 characters long', async ()=>{
    const newUser = {
        username: "Waxz32",
        name: "Moxy",
        password: "z1"
    }

    const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)

        const usersAtEnd = await helper.usersInDb()
        expect(response.body.error).toBe('User validation failed: minlength less than 3')
        expect(usersAtEnd).toHaveLength(helper.initialUsers.length)
})

afterAll(() => {
    mongoose.connection.close()
})