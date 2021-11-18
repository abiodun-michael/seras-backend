const { DataTypes } = require("sequelize")
const Connection = require("./Connection")

const Theme = Connection.define("theme",{
    title:{
        type:DataTypes.STRING,
        allowNull:false
    },
    desc:{
        type:DataTypes.STRING,
        allowNull:true
    },
    status:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:false
    }
})


Theme.sync({force:false})

module.exports = Theme