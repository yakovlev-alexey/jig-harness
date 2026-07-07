import { prisma } from '../../../common/prisma.js';

type FindUserByEmailInput = {
  email: string;
};

export async function findUserByEmailQuery(input: FindUserByEmailInput) {
  return prisma.user.findUnique({
    where: { email: input.email },
  });
}
