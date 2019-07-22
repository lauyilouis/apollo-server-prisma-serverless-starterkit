import { mergeResolvers } from 'merge-graphql-schemas';
import typeDefs from './schema.graphql';

// Resolvers
import userResolvers from './users/resolvers';

const resolvers = mergeResolvers([
  userResolvers,
]);

export {
  typeDefs,
  resolvers,
};
