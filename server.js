require('dotenv').config()
const express = require("express")
const { ApolloServer } = require("apollo-server-express")
const cookieParser = require("cookie-parser")
const cors = require('cors')
const {typeDefs, resolvers} = require('./graphql/index')
const {checkAuth} = require('./util')
const jwt = require('jsonwebtoken')



const PORT = process.env.PORT || 5000



let allowedOrigins = [
  'http://localhost:3000',
  'https://studio.apollographql.com'
]

const startApolloServer = async()=>{

    const app = express();
    app.use(express.json({limit:'10MB'}))
    app.use(cookieParser())
    app.use(cors({origin:(origin, callback)=>{
      
      if(!origin) return callback(null, true)
  
      if(allowedOrigins.indexOf(origin) === -1){
        var msg = 'The CORS policy for this site does not ' +
                  'allow access from the specified Origin.'
        return callback(new Error(msg), false)
      }
      return callback(null, true)
  },credentials:true}))
  

  
const server = new ApolloServer({ 
  typeDefs, 
  resolvers,
    context:async({req,res})=>{
      let user = {}
      const authorization = req.headers.authorization
      if(authorization){
        const token = authorization.split(' ')[1]
        try{
          const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
          if(decoded){
            user = await checkAuth(decoded)
          }
        }catch(err){
          console.log(err)
        }
        
      }
      return{req,res,user}
    }
  })
    
await server.start()

server.applyMiddleware({app,cors:false})

app.listen(PORT,()=>{
  console.log(`Auth Service running at http://localhost:${PORT}`)
})
  
}
  

startApolloServer()