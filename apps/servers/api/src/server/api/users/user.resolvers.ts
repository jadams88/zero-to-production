import { IUserDocument } from '@uqt/api/core-data';
import { generateResolvers } from '@uqt/api/utils';
import { User } from './user.model';
import { verifyTokenGraphQL } from '../../auth/auth';

const resolvers = generateResolvers<IUserDocument>(User);

export const userResolvers = {
  Query: {
    User: verifyTokenGraphQL(resolvers.getOne),
    allUsers: verifyTokenGraphQL(resolvers.getAll)
  },
  Mutation: {
    updateUser: verifyTokenGraphQL(resolvers.updateOne),
    removeUser: verifyTokenGraphQL(resolvers.removeOne)
  }
};
