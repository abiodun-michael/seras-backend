require('dotenv').config()
const {gql} = require('apollo-server-express')
const {ChurchAdmin,Member, Church} = require('../database')
const {sendActivationCode} = require('../mails')
const otpGenerator = require('otp-generator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const churchAdminTypes = gql`

    type ChurchAdminMutationResponse{
        message:String
        status:Boolean
        data:ChurchAdmin
    }

    type ChurchAdminLoginMutationResponse{
        message:String
        status:Boolean
        firstTimeLogin:Boolean
        token:String
        role:String
    }

    type ChurchAdmin{
        id:Int
        lastLoggedIn:String
        dateCreated:Date
        status:String
        role:String
        member:Member
    }

    input ChangeAdminPasswordInput{
        currentPassword:String!
        password:String!
    }

    input  CreateChurchAdminInput{
        userId:Int!
        role:String!
        churchId:Int
    }

    input UpdateChurchAdminInput{
        id:Int!
        email:String!
        phone:String!
        role:String
    }

    input ChurchAdminLoginInput{
        email:String!
        password:String!
    }

    input ChangeAdminRoleInput{
        id:Int!
        role:String!
    }

    extend type Query{
        getAllChurchAdmin:[ChurchAdmin]
        getChurchAdminById(id:Int!):ChurchAdmin
        getMyProfile:ChurchAdmin
    }

    extend type Mutation{
        createChurchAdmin(input:CreateChurchAdminInput):ChurchAdminMutationResponse
        updateChurchAdmin(input:UpdateChurchAdminInput):ChurchAdminMutationResponse,
        loginChurchAdmin(input:ChurchAdminLoginInput):ChurchAdminLoginMutationResponse,
        deactivateChurchAdmin(id:Int!):ChurchAdminMutationResponse
        changeChurchAdminPassword(password:String!):ChurchAdminMutationResponse,
        forgotChurchAdminPassword(email:String!):ChurchAdminMutationResponse
        createChurchAdminBySuperAdmin(input:CreateChurchAdminInput!):ChurchAdminMutationResponse
        resetAdmin(id:Int!):ChurchAdminMutationResponse
        deleteAdmin(id:Int!):ChurchAdminMutationResponse
        changeAdminPassword(input:ChangeAdminPasswordInput!):ChurchAdminMutationResponse
        changeAdminRole(input:ChangeAdminRoleInput!):ChurchAdminMutationResponse
    }
`

const churchAdminResolvers = {
    Query:{
        getAllChurchAdmin:async(_,__,{user})=>{
            if(!user) return
            return await ChurchAdmin.findAll({where:{churchId:user.churchId},order:[["id","DESC"]]})
        },
        getChurchAdminById:async(_,{id},{user})=>{
            if(!user) return
            return await ChurchAdmin.findOne({where:{id,churchId:user?.churchId}})
        },

        getMyProfile: async(_,__,{user})=>{
            if(!user) return
            return await ChurchAdmin.findOne({where:{memberId:user.id}})
        }
        
    },

    ChurchAdmin:{
        member: async({memberId})=>{
            return await Member.findOne({where:{id:memberId}})
        }
    },
    Mutation:{
        createChurchAdmin:async(_,{input},{user})=>{
            if(!user || user?.role != "ADMIN") return{message:"You do not have the permission to perform this operation", status:false}
            const salt = bcrypt.genSaltSync(10)
            const code = otpGenerator.generate(7, { upperCase: false, specialChars: false })
            const password = bcrypt.hashSync(code, salt)

            const member = await Member.findOne({where:{id:input.userId}, attributes:["id","email","churchId","groupId","cellId"]})
            if(member){
            if(!member) return{message:"User does not exist", status:false}
            if(member.churchId != user.churchId) return{message:"Member not in your church", staus:false}
            
            if(member.email == null) return{message:"Member does not have an email address", status:false}

           
            const [churchadmin,created] = 
                await ChurchAdmin.findOrCreate({where:{memberId:input.userId}, defaults:{
                    password,
                    role:input.role,
                    memberId:input.userId,
                    churchId:member.churchId
                }})
            
            if(created){
                sendActivationCode(member.email,code,member.firstName)
                return{
                    message:"Account has been created",
                    status:true,
                    data:{
                        memberId:input.userId,
                        name:member.firstName+' '+member?.lastName,
                        role:churchadmin.role,
                        status:churchadmin.status,
                        email:member.email,
                    }
                }
            }
            return{
                message:"User already an admin",
                status:false
            }
        }
        return{
            message:"User does not exist",
            status:false
        }
        },

        createChurchAdminBySuperAdmin:async(_,{input})=>{
            const salt = bcrypt.genSaltSync(10)
            const code = otpGenerator.generate(7, { upperCase: false, specialChars: false })
            const password = bcrypt.hashSync(code, salt)
            
            const member = await Member.findOne({where:{id:input.userId}})
         
            const [churchadmin,created] = await ChurchAdmin.findOrCreate({where:{memberId:input.userId}, 
                defaults:{password,role:'ADMIN',memberId:input.userId,churchId:input.churchId}})
            if(created){
                sendActivationCode(member.email,code,member.firstName+' '+member.lastName)
                    return{
                        message:"Account has been created",
                        status:true,
                        data:{
                            name:member.firstName+' '+member?.lastName,
                            role:churchadmin.role,
                            status:churchadmin.status,
                            email:member.email,
                        }
                    }
                
            }
            return{
                message:"Admin with email already exist",
                status:false
            }
        },

        loginChurchAdmin:async(_,{input})=>{
            const member = await Member.findOne({where:{email:input.email}})
            if(member){
                const churchAdmin = 
                    await ChurchAdmin.findOne({where:{memberId:member.id}})
                const isTrue = bcrypt.compareSync(input.password, churchAdmin.password)
               
                if(isTrue){
                    const token = jwt.sign({id:member.id,app:"church_admin"}, process.env.JWT_SECRET_KEY,{ expiresIn: '24h' })
                    return{
                        message:"Authenticated",
                        status:true,
                        firstTimeLogin:churchAdmin.firstTimeLogin,
                        token,
                        role:churchAdmin.role
                    }
                }
                return{
                    message:"Invalid email and password combination",
                    status:false
                }
            }
            return{
                message:"Invalid email or password",
                status:false
            }
        },

        updateChurchAdmin:async(_,{input},{user})=>{
            if(!user || user?.role != "ADMIN") return{message:"You do not have the permission to perform this operation", status:false}
            const updated = await ChurchAdmin.update(input, {where:{id:input.id}})
            if(updated){
                return{
                    message:"Admin info updated",
                    status:true,
                    data:input
                }
            }
            return{
                message:"An error occured",
                status:false
            }
        },

        changeChurchAdminPassword:async(_,{password},{user})=>{
            const salt = bcrypt.genSaltSync(10)
            const newPassword = bcrypt.hashSync(password, salt)
            const updated = await ChurchAdmin.update({status:"ACTIVATED",password:newPassword,firstTimeLogin:false},{where:{memberId:user.id}})
            if(updated){

                return{
                    message:"Password has been changed",
                    status:true,
                    data:{
                        role:user.role
                    }
                }
            }
            return{
                message:"An error occured",
                status:false
            }
        },
        
        forgotChurchAdminPassword:async(_,{email})=>{
            const salt = bcrypt.genSaltSync(10)
            const code = otpGenerator.generate(7, { upperCase: false, specialChars: false })
            const newPassword = bcrypt.hashSync(code, salt)
            const updated = await ChurchAdmin.update({status:"PENDING",password:newPassword,firstTimeLogin:true},{where:{email:email}})
            if(updated){
                const churchAdmin = await ChurchAdmin.findOne({where:{email}})
                sendActivationCode(email,code,churchAdmin.name)
                return{
                    message:"Password has been changed",
                    status:true
                }
            }
            return{
                message:"An error occured",
                status:false
            }
        },

        deactivateChurchAdmin:async(_,{id})=>{

            const isDeleted = await ChurchAdmin.update({status:"DEACTIVATED"},{where:{id}})
            if(isDeleted){
                return{
                    message:"Admin has been deactivated",
                    status:true
                }
            }
            return{
                message:"An error occured",
                status:false
            }
        },
        deleteAdmin:async(_,{id})=>{
            const isDelete = await ChurchAdmin.destroy({where:{memberId:id}})
            if(isDelete){
                return{
                    message:"Admin account deleted",
                    status:true
                }
            }
            return{
                message:"An error occured",
                status:false
            }
        },
        changeAdminRole: async(_,{input},{user})=>{
            if(!user || user.role != 'ADMIN') return {message:"You do not have enough permission to perform this operation", status:false}
            const update = await ChurchAdmin.update({role:input.role},{where:{id:input.id}})
            if(update){
                return{
                    message:"admin role updated",
                    status:true,
                    data:{
                        memberId:input.id,
                        role:input.role
                    }
                }
            }

            return{
                message:"There was an error",
                status:false
            }
        },
        changeAdminPassword: async(_,{input},{user})=>{
            if(!user)return{message:"You must be logged in", status:false}
            const admin = await ChurchAdmin.findOne({where:{memberId:user.id}})
            const isTrue = bcrypt.compareSync(input.currentPassword, admin.password)
            if(isTrue){
                const salt = bcrypt.genSaltSync(10)
                const newPassword = bcrypt.hashSync(input.password, salt)
                const updated = await ChurchAdmin.update({password:newPassword},{where:{memberId:user.id}})
                if(updated){
                    return{
                        message:"Account Password has been changed",
                        status:true
                    }
                }
                return{
                    message:"Sorry, an error occured",
                    status:false
                }
            }
            return{
                message:"Current password does not match",
                status:false
            }  
            
        }
    }
}

module.exports = {churchAdminTypes,churchAdminResolvers}