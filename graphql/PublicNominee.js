const {gql} = require('apollo-server-express')
const {PublicNominee} = require('../database')
const {uploadImage} = require('../util/fileUploader')

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

    type PublicCategory{
        category:String
        nominee:[PublicNominee]
    }

    type PublicNominee{
        id:Int
        name:String
        country:String
        type:String
        picture:String
        category:String
        vote:Int
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
        file:Upload
        category:String
    }

    extend type Query{
        getAllPublicNominee:[PublicNominee]
        getPublicNomineeById(id:Int!):PublicNominee
        getAllNominee:[PublicCategory]
    }

    extend type Mutation{
        createPublicNominee(input:CreatePublicNomineeInput):PublicNomineeMutationResponse
        updatePublicNominee(input:UpdatePublicNomineeInput):PublicNomineeMutationResponse
        deletePublicNominee(id:Int!):PublicNomineeMutationResponse
        vote(id:Int!):PublicNomineeMutationResponse
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

        getAllNominee:async()=>{
            return [
                {category:"Best Personality (Influencer for Good)"},
                {category:"Africa's Top Celebrity (Promotion of social Good and Justice)"},
                {category:"Most responsible company (People's choice)"},
            ]
        }
    },
    PublicCategory:{
        nominee: async({category})=>{
            return await PublicNominee.findAll({where:{category}})
        }
    },
    Mutation:{
        createPublicNominee:async(_,{input})=>{
                const nominee = await PublicNominee.findOne({where:{name:input.name,country:input.country}})
            if(!nominee){
                const {createReadStream, filename, mimetype, encoding} = await input.file
                const stream = createReadStream()
                const {secure_url} = await uploadImage(stream,"nominee")
                input.picture = secure_url
    
            
           
            const [category, created] = await PublicNominee.findOrCreate({where:{name:input.name}, defaults:input})
           
            

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
        }
        return{
            message:"Nominee already exist",
            status:false
        }
        },
        updatePublicNominee:async(_,{input})=>{

            if(input.file){
                const {createReadStream, filename, mimetype, encoding} = await input.file
                const stream = createReadStream()
                const {secure_url} = await uploadImage(stream,"nominee")
                input.picture = secure_url
            }
            
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
        },
        deletePublicNominee: async(_,{id})=>{
            const isDeleted = await PublicNominee.destroy({where:{id}})
            if(isDeleted){
                return{
                    message:"nominee deleted",
                    status:true
                }
            }else{
                return{
                    message:"An error occured",
                    status:false
                }
            }
        },
        vote:async(_,{id})=>{
            const nominee = await PublicNominee.findOne({where:{id}})
            if(nominee){
                const votes = nominee.vote == null ? 1: nominee.vote+1
                await PublicNominee.update({vote:votes},{where:{id}})
                return{
                    message:"Your vote has been submitted",
                    status:true
                }
            }
            return{
                message:"Invalid nominee",
                status:false
            }
        }
    }
}

module.exports = {nomineeTypes,nomineeResolvers}