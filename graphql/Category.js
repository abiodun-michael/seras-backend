const {gql} = require('apollo-server-express')
const {Category} = require('../database')


const categoryTypes = gql`
    type CategoryMutationResponse{
        status:Boolean
        message:String
        data:Category
    }

    type Category{
        id:Int
        name:String
        desc:String
        totalCount:Int
    }

    input CreateCategoryInput{
        name:String!
        desc:String!
    }

    input UpdateCategoryInput{
        name:String!
        desc:String!
    }

    extend type Query{
        getAllCategory:[Category]
        getCategoryById(id:Int!):Category
    }

    extend type Mutation{
        createCategory(input:CreateCategoryInput):CategoryMutationResponse
        updateCategory(input:UpdateCategoryInput):CategoryMutationResponse
    }
`


const categoryResolvers = {

    Query:{
        getAllCategory:async()=>{
            return await Category.findAll()
        },
        getCategoryById:async(_,{id})=>{
            return await Category.findOne({where:{id}})
        },
    },

    Mutation:{
        createCategory:async(_,{input})=>{
            const [category, created] = await Category.findOrCreate({where:{name:input.name}, defaults:input})
            if(created){
                return{
                    message:"Category added",
                    status:true,
                    data:category
                }
            }
            return{
                message:"Category already exist",
                status:false
            }
        },
        updateCategory:async(_,{input})=>{
            const updated = await Category.update(input,{where:{id:input.id}})
            if(updated){
                return{
                    message:"Category info updated",
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

module.exports = {categoryTypes,categoryResolvers}