const { DataTypes } = require("sequelize")
const Connection = require("./Connection")
const Theme = require('./Theme')

const Category = Connection.define("category",{
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

Theme.hasMany(Category)
Category.sync({force:false})


module.exports = Category