import { stringArg, extendType, nonNull } from 'nexus'
import { compare, hash } from 'bcrypt'
import { generateAccessToken, handleError } from '../../utils/helpers'
import { errors } from '../../utils/constants'
import mutations from 'api/mutations'
console.log(mutations)
export const user = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('signup', {
      type: 'AuthPayload',
      args: {
        name: stringArg(),
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      async resolve(_parent, { name, email, password }, ctx) {
        try {
          const hashedPassword = await hash(password, 10)

          const user = await ctx.prisma.user.create({
            data: {
              name,
              email,
              password: hashedPassword,
            },
          })

          const accessToken = generateAccessToken(user.id)
          return {
            accessToken,
            user,
          }
        } catch (e) {
          handleError(errors.userAlreadyExists)
        }
      },
    })

    t.field('login', {
      type: 'AuthPayload',
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      async resolve(root, { email, password }, ctx) {
        let user = null
        try {
          user = await ctx.prisma.user.findUnique({
            where: {
              email,
            },
          })
        } catch (e) {
          console.log(e)
          handleError(errors.invalidUser)
        }

        if (!user) handleError(errors.invalidUser)
        const passwordValid = await compare(password, user.password)
        if (!passwordValid) handleError(errors.invalidUser)

        const accessToken = generateAccessToken(user.id)
        return {
          accessToken,
          user,
        }
      },
    })
  },
})
// const createMutation = (obj)=>{
//   return extendType({
//     type: 'Mutation',
//     definition(t){
//       const nullable = obj.props.some((prop)=>prop.name==='nullable' && prop.initializer==='true')
//       const type = obj.props.find((prop)=>prop.name==='root').type
//       const args = obj.props.find((prop)=>prop.name==='args').type
//       obj.props.map(prop=>{
//         let b = t
//         switch(true){
//           case nullable:
//             b = b.nullable
//           case prop.kind === 'StringKeyword':
//             b=b.string(prop.name)
//             break;
//           case prop.type === 'Int':
//             b = b.int(prop.name)
//             break;
//           case prop.kind === 'ArrayType':
//             b.list.field(prop.name, {
//               type: type,
//               ...args
//               ...prop.function && {
//                 async resolve(root, args, ctx){
//                   await models[obj.name][prop.name].bind(root).call(args,ctx)
//                 }
//               }
//             })
//             break;
//           default:
//         }
//       })
//     }
//   })
// }