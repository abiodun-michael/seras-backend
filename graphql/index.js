const { mergeTypeDefs,mergeResolvers  } = require('@graphql-tools/merge')
const {categoryTypes,categoryResolvers} = require('./Category')

const types = [
  categoryTypes
  ];
  
const resolvers = [
  categoryResolvers
];
    

module.exports = {typeDefs:mergeTypeDefs(types), resolvers: mergeResolvers(resolvers)};