const { mergeTypeDefs,mergeResolvers  } = require('@graphql-tools/merge')
const {categoryTypes,categoryResolvers} = require('./Category')
const {votersTypes,votersResolvers} = require('./PublicVoter')


const types = [
  categoryTypes,
  votersTypes
  ];
  
const resolvers = [
  categoryResolvers,
  votersResolvers
];
    

module.exports = {typeDefs:mergeTypeDefs(types), resolvers: mergeResolvers(resolvers)};