const { DataTypes } = require('sequelize')
const Connection = require("./Connection")



const Admin = Connection.define("admin",{
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false
    },
    phone:{
        type:DataTypes.STRING,
        allowNull:false
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false
    },
    role:{
        type:DataTypes.STRING,
        allowNull:false
    },
    firstTimeLogin:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:true
    },
    status:{
        type:DataTypes.ENUM("ACTIVATED","DEACTIVATED","PENDING"),
        allowNull:false,
        defaultValue:"PENDING"
    }
})


Admin.sync({force:false})

module.exports = Admin