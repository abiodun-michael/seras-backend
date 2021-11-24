const { mergeTypeDefs,mergeResolvers  } = require('@graphql-tools/merge')
const {categoryTypes,categoryResolvers} = require('./Category')
const {nomineeTypes,nomineeResolvers} = require('./PublicNominee')
const {adminTypes,adminResolvers} = require('./Admin')


const types = [
  categoryTypes,
  nomineeTypes,
  adminTypes
  ];
  
const resolvers = [
  categoryResolvers,
  nomineeResolvers,
  adminResolvers
];
    

module.exports = {typeDefs:mergeTypeDefs(types), resolvers: mergeResolvers(resolvers)};