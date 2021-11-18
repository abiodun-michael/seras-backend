const { DataTypes } = require("sequelize")
const Connection = require("./Connection")
const PubilcNominee = require('./PublicNominees')

const PublicVoters = Connection.define("publicvoter",{
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    email:{
        type:DataTypes.STRING,
        allowNull:true
    }
})

PubilcNominee.hasMany(PublicVoters)

PublicVoters.sync({force:false})

module.exports = PublicVoters