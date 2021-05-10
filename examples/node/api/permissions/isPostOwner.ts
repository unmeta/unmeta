import { Permission } from "./index";


export class isPostOwner implements Permission {
  cache: 'contextual';
  static async resolve(_, args, ctx) {
    let id = args.where ? args.where.id : args.id;
    try {
      const author = await ctx.prisma.post
        .findUnique({
          where: {
            id,
          },
        })
        .author();
      return ctx?.userId === author?.id;
    } catch (e) {
      return e;
    }
  }
}
