const {gql} = require('apollo-server-express')
const {PublicNominee} = require('../database')

const {
    GraphQLUpload,
  } = require('graphql-upload');

const nomineeTypes = gql`

    scalar Upload

    type PublicNomineeMutationResponse{
        status:Boolean
        message:String
        data:PublicNominee
    }

    type PublicNominee{
        id:Int
        name:String
        country:String
        type:String
        picture:String
        category:String
    }

    input CreatePublicNomineeInput{
        name:String!
        country:String!
        type:String!
        file:Upload!
        category:String!
    }

    input UpdatePublicNomineeInput{
        id:Int!
        name:String
        country:String
        type:String
        file:Upload!
        category:String
    }

    extend type Query{
        getAllPublicNominee:[PublicNominee]
        getPublicNomineeById(id:Int!):PublicNominee
    }

    extend type Mutation{
        createPublicNominee(input:CreatePublicNomineeInput):PublicNomineeMutationResponse
        updatePublicNominee(input:UpdatePublicNomineeInput):PublicNomineeMutationResponse
    }
`


const nomineeResolvers = {
    Upload: GraphQLUpload,
    Query:{
        getAllPublicNominee:async()=>{
            return await PublicNominee.findAll()
        },
        getPublicNomineeById:async(_,{id})=>{
            return await PublicNominee.findOne({where:{id}})
        },
    },
   
    Mutation:{
        createPublicNominee:async(_,{input})=>{
            const [category, created] = await PublicNominee.findOrCreate({where:{name:input.name}, defaults:input})
            const {createReadStream, filename, mimetype, encoding} = await input.file
            console.log(filename)
            console.log(createReadStream)
            input.picture = 'ss'
            if(created){
                return{
                    message:"Nominee added",
                    status:true,
                    data:category
                }
            }
            return{
                message:"Nominee already exist",
                status:false
            }
        },
        updatePublicNominee:async(_,{input})=>{
            const updated = await PublicNominee.update(input,{where:{id:input.id}})
            if(updated){
                return{
                    message:"Nominee info updated",
                    status:true,
                    data:input
                }
            }
            return{
                message:"An error occured",
                status:false
            }
        }
    }
}

module.exports = {nomineeTypes,nomineeResolvers}