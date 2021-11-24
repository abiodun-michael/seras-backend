const {Admin} = require('../database')


const checkAuth = async(obj)=>{
        return await Admin.findOne({where:{id:obj.id}})
}


module.exports = {checkAuth}