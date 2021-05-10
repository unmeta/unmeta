import { compare } from 'bcrypt';
// import { generateAccessToken, handleError } from '../../utils/helpers';
// import { errors } from '../../utils/constants';
import { Mutation, AuthPayload, AuthArgs } from './index';
export class Login implements Mutation {
  root: AuthPayload;
  args: AuthArgs;
  nullable=true
  async resolve(root, { email, password }, ctx) {
    let user = null;
    try {
      user = await ctx.prisma.user.findUnique({
        where: {
          email,
        },
      });
    } catch (e) {
      console.log(e);
      handleError(errors.invalidUser);      
    }

    if (!user)
      handleError(errors.invalidUser);
    const passwordValid = await compare(password, user.password);
    if (!passwordValid)
      handleError(errors.invalidUser);

    const accessToken = generateAccessToken(user.id);
    return {
      accessToken,
      user,
    };
  }
}

export  function some(){
  console.log('dsd')
  return  compare('as',"asdd")

}
