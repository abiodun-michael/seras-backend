const {Teacher,ChurchAdmin,Member} = require('../database')


const checkAuth = async(obj)=>{
   
    if(obj.app == "church_admin"){
        const churchAdmin = await ChurchAdmin.findOne({where:{memberId:obj.id}})
        if(churchAdmin){
            const member = await Member.findOne({where:{id:obj.id}, 
                attributes:["id","firstName","lastName","churchId","groupId","cellId"]})
            
            return {
                role:churchAdmin.role,
                status:churchAdmin.status,
                id:member.id,
                churchId:member.churchId,
                groupId:member.groupId,
                cellId:member.cellId
            }
        }
        return {}
    }

    return {}
}


module.exports = {checkAuth}