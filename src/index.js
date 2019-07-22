import { ApolloServer } from 'apollo-server-lambda';

// GraphQL
import { typeDefs, resolvers } from './graphql';

// Prisma Client
import { prisma } from './generated/prisma-client';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  path: '/graphql',
  context: ({ req }) => {
    return {
      prisma,
    };
  },
});

exports.graphqlHandler = server.createHandler({
  cors: {
    origin: '*',
    credentials: true,
  },
});
