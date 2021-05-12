const _ = require('lodash')

const dummy = (blogs) => {
    return 1 
}

const totalLikes = (blogs) =>{
    const total = blogs.reduce((accumlator,blog) =>{
        return accumlator + blog.likes
    },0)
    return total
}

const favoriteBlog = (blogs) => {
    const favorite = blogs.reduce((max, blog)=>{
        return max.likes > blog.likes ? 
            {title:max.title, author: max.author, likes:max.likes} : 
            {title:blog.title, author: blog.author, likes:blog.likes}
    },{})
    return favorite
}

const mostBlogs = (blogs) => {
    const result = _(blogs)
        .countBy( blog => blog.author)
        .entries()
        .maxBy(_.last)

    return result ? 
        {author: result[0], blogs: result[1]}:
        {}
}

const mostLikes = (blogs) => {

    const result = _(blogs)
        .groupBy('author')
        .map((author, name)=> ({
            author: name,
            likes: _.sumBy(author, 'likes')
        }))
        .maxBy(blog => blog.likes)
    
    return result ?  result : {}
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}