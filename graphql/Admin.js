require('dotenv').config()
const {gql} = require('apollo-server-express')
const {Admin} = require('../database')
const {sendNotification} = require('../mails')
const otpGenerator = require('otp-generator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


const msg = {
    to: '',
    from: 'noreply@theseras.com',
    subject: '',
    html: ''
  };


const adminTypes = gql`

    type AdminMutationResponse{
        message:String
        status:Boolean
        data:Admin
    }

    type AdminLoginMutationResponse{
        message:String
        status:Boolean
        firstTimeLogin:Boolean
        token:String
    }

    type Admin{
        id:Int
        name:String
        email:String
        phone:String
        role:String
    }

    input ChangeAdminPasswordInput{
        currentPassword:String!
        password:String!
    }

    input  CreateAdminInput{
        name:String!
        email:String!
        phone:String!
        role:String!
    }

    input UpdateAdminInput{
        id:Int!
        name:String!
        email:String!
        phone:String!
        role:String!
    }

    input AdminLoginInput{
        email:String!
        password:String!
    }

    extend type Query{
        getAllAdmin:[Admin]
        getAdminById(id:Int!):Admin
        getMyAdminProfile:Admin
    }

    extend type Mutation{
        createAdmin(input:CreateAdminInput):AdminMutationResponse
        updateAdmin(input:UpdateAdminInput):AdminMutationResponse,
        loginAdmin(input:AdminLoginInput):AdminLoginMutationResponse,
        deactivateAdmin(id:Int!):AdminMutationResponse
        setAdminPassword(password:String!):AdminMutationResponse,
        forgotAdminPassword(email:String!):AdminMutationResponse
        createAdminBySuperAdmin(input:CreateAdminInput!):AdminMutationResponse
        # resetAdmin(id:Int!):AdminMutationResponse
        # deleteAdmin(id:Int!):ChurchAdminMutationResponse
        changeAdminPassword(input:ChangeAdminPasswordInput!):AdminMutationResponse
        # changeAdminRole(input:ChangeAdminRoleInput!):ChurchAdminMutationResponse
    }
`

const adminResolvers = {
    Query:{
        getAllAdmin:async(_,__,{user})=>{
            if(!user) return
            return await Admin.findAll({order:[["id","DESC"]]})
        },
        getAdminById:async(_,{id},{user})=>{
            if(!user) return
            return await Admin.findOne({where:{id}})
        },

        getMyAdminProfile: async(_,__,{user})=>{
            if(!user) return
            return await Admin.findOne({where:{id:user.id}})
        }
        
    },

    Admin:{
       group: async({groupId})=> await Group.findOne({where:groupId})
    },
    Mutation:{
        createAdmin:async(_,{input},{user})=>{
            if(!user || user?.role != "ADMIN") return{message:"You do not have the permission to perform this operation", status:false}
            const salt = bcrypt.genSaltSync(10)
            const code = otpGenerator.generate(7, { upperCase: false, specialChars: false })
            input.password = bcrypt.hashSync(code, salt)

            const [admin, created] = await Admin.findOrCreate({where:{email:input.email}, defaults:input})
            
            
            if(created){
                
                msg.to = admin.email
                msg.subject = "Welcome! Theseras Admin"
                msg.html = `
                    <p>Hi, ${admin.name},<br />
                    An account has been setup for you on the Theseras portal.</p>
                    <p>Below is a temporary password for you to login. You don't need to memorise 
                    it as you will have the opportunity to change it when you try to login for the first time.</p>
                    <h3 style="margin-top:10px; margin-bottom:10px;">${code}</h3>

                    <p>Kindly request for the link to the portal from an admin.</p>
                    <p>Sincerely,<br /> Theseras Tech Team</p>
                `
                sendNotification(msg)

                return{
                    message:"Account has been created",
                    status:true,
                    data:admin
                }
            }
            return{
                message:"User already an admin",
                status:false
            }
        },

        createAdminBySuperAdmin:async(_,{input})=>{
            const salt = bcrypt.genSaltSync(10)
            const code = otpGenerator.generate(7, { upperCase: false, specialChars: false })
            input.password = bcrypt.hashSync(code, salt)
           
            const [admin,created] = await Admin.findOrCreate({where:{email:input.email}, defaults:input})
            if(created){
                 msg.to = admin.email
                msg.subject = "Welcome! Theseras Admin"
                msg.html = `
                <p>Hi, ${admin.name},<br />
                An account has been setup for you on the Theseras portal.</p>
                <p>Below is a temporary password for you to login. You don't need to memorise 
                it as you will have the opportunity to change it when you try to login for the first time.</p>
                <h3 style="margin-top:10px; margin-bottom:10px;">${code}</h3>

                <p>Kindly request for the link to the portal from an admin.</p>
                <p>Sincerely,<br /> Theseras Tech Team</p>
                `
                sendNotification(msg)
                    return{
                        message:"Account has been created",
                        status:true,
                        data:admin
                    }
                
            }
            return{
                message:"Admin with email already exist",
                status:false
            }
        },

        loginAdmin:async(_,{input})=>{
            const admin = await Admin.findOne({where:{email:input.email}})
            if(admin){
                const isTrue = bcrypt.compareSync(input.password, admin.password)
               
                if(isTrue){
                    const token = jwt.sign({id:admin.id,app:"cms_office"}, process.env.JWT_SECRET_KEY,{ expiresIn: '24h' })
                    return{
                        message:"Authenticated",
                        status:true,
                        firstTimeLogin:admin.firstTimeLogin,
                        token
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

        updateAdmin:async(_,{input},{user})=>{
            if(!user || user?.role != "ADMIN") return{message:"You do not have the permission to perform this operation", status:false}
            const updated = await Admin.update(input, {where:{id:input.id}})
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

        setAdminPassword:async(_,{password},{user})=>{
            const salt = bcrypt.genSaltSync(10)
            const newPassword = bcrypt.hashSync(password, salt)
            const updated = await Admin.update({status:"ACTIVATED",password:newPassword,firstTimeLogin:false},{where:{id:user.id}})
            if(updated){
                msg.to = user.email
                msg.subject = "Important! Theseras Admin"
                msg.html = `
                    <p>Hi, ${user.name},<br /> we noticed that your password has changed. If you aware of this action, please ignore this email. If not, reachout to your church admin for help.</p>
                    <br />
                    <br />
                    <p><b>Sincerely</b>,<br /> Theseras Tech Team</p>
                `
                sendNotification(msg)
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
        
        forgotAdminPassword:async(_,{email})=>{
            const salt = bcrypt.genSaltSync(10)
            const code = otpGenerator.generate(7, { upperCase: false, specialChars: false })
            const newPassword = bcrypt.hashSync(code, salt)
            const updated = await Admin.update({status:"PENDING",password:newPassword,firstTimeLogin:true},{where:{email:email}})
            if(updated){
                const admin = await Admin.findOne({where:{email}})
                msg.to = email
                msg.subject = "Password Reset | Theseras Admin"
                msg.html = `
                    <p>Hi ${admin.name}, find your one time password below. You'll be able to change it when you try to login.</p>
                    <h3 style="margin-top:10px; margin-bottom:10px;">${code}</h3>
                    <br />
                    <br />
                    <p><b>Sincerely</b>,<br /> Theseras Tech Team</p>
                `
                sendNotification(msg)
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

        deactivateAdmin:async(_,{id})=>{

            const isDeleted = await Admin.update({status:"DEACTIVATED"},{where:{id}})
            if(isDeleted){
                msg.to = email
                msg.subject = "Important | Theseras Admin"
                msg.html = `
                    <p>Hi, your access to the portal has been revoked. 
                    What this means is that you will not be able to login or perform any action on the  portal unless it is restored. We would love to help restore it but we cannot. Do reachout to your church or group admin for help.</p>
                    <br />
                    <br />
                    <p><b>Sincerely</b>,<br /> Theseras Tech Team</p>
                `
                sendNotification(msg)
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
     
    }
}

module.exports = {adminTypes,adminResolvers}