import { Permission } from '../permissions'
import { isAuthenticatedUser } from '../permissions/isAuthenticatedUser'
import { isPostOwner } from '../permissions/isPostOwner'
import {and, or, Query} from './index'
function permission(...args: Permission[]):any{}
function filter(...args: Permission[]):any{}
function middleware(...args: Permission[]):any{}

@middleware()
@filter()
@permission(and(isAuthenticatedUser, isPostOwner))
export class Me implements Query {
  
  async resolve(_, __, ctx){
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.userId,
      },
    })
    return user
  }
}
