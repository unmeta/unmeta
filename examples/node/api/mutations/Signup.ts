import { hash } from 'bcrypt';
// import { generateAccessToken, handleError } from '../../utils/helpers';
// import { errors } from '../../utils/constants';
import { Mutation, AuthPayload, AuthArgs } from './index';

export class Signup implements Mutation {
  async resolve(root, { name, email, password }:AuthArgs, ctx): Promise<AuthPayload> {
    try {
      const hashedPassword = await hash(password, 10);

      const user = await ctx.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      const accessToken = generateAccessToken(user.id);
      return {
        accessToken,
        user,
      };
    } catch (e) {
      
      handleError(errors.userAlreadyExists);
    }
  }
}
