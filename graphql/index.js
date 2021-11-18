const { mergeTypeDefs,mergeResolvers  } = require('@graphql-tools/merge')
const {categoryTypes,categoryResolvers} = require('./Category')
const {nomineeTypes,nomineeResolvers} = require('./PublicNominee')


const types = [
  categoryTypes,
  nomineeTypes
  ];
  
const resolvers = [
  categoryResolvers,
  nomineeResolvers
];
    

module.exports = {typeDefs:mergeTypeDefs(types), resolvers: mergeResolvers(resolvers)};