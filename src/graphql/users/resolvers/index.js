import { getToken, validateToken } from '../../../jwt/index';

// Mutations
import signUp from './signUp';

export default {
  Query: {
    hello: () => 'Hellow World!',
    getUsers: (_, args, context) => context.prisma.users(),
    getToken: () => getToken(),
    validateToken: (_, { token }) => validateToken(token),
  },
  Mutation: {
    signUp,
  },
};
