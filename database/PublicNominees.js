const { DataTypes } = require("sequelize")
const Connection = require("./Connection")
const Theme = require('./Theme')

const PublicNominee = Connection.define("publicnominee",{
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    country:{
        type:DataTypes.STRING,
        allowNull:true
    },
    type:{
        type:DataTypes.ENUM("COMPANY","ARTISTE"),
        allowNull:true
    },
    picture:{
        type:DataTypes.STRING,
        allowNull:true
    },
    category:{
        type:DataTypes.STRING,
        allowNull:true
    }
})

Theme.hasMany(PublicNominee)
PublicNominee.sync({force:false})

module.exports = PublicNominee