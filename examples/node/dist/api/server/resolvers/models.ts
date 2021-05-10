import { objectType } from 'nexus'

export const Post = objectType({
  name: 'Post',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.boolean('published')
    t.nonNull.string('title')
    t.string('content')
    t.field('author', {
      type: 'User',
      resolve(root, _, ctx) {
        return ctx.prisma.post.findFirst({ where: { id: root.id } }).author()
      },
    })
  },
})

export const User = objectType({
  name: 'User',
  definition(t) {
    t.nonNull.int('id')
    t.string('name')
    t.nonNull.string('email')
    t.nonNull.list.field('posts', {
      type: 'Post',
      resolve(root, _, ctx) {
        return ctx.prisma.user.findFirst({ where: { id: root.id } }).posts()
      },
    })
  },
})

export const AuthPayload = objectType({
  name: 'AuthPayload',
  definition(t) {
    t.string('accessToken')
    t.field('user', { type: 'User' })
  },
})
const models = {}
const createModel = (obj)=>{
  return objectType({
    name: obj.name,
    definition(t){
      obj.props.map(prop=>{
        let b = t
        switch(true){
          case prop.required:
            b = b.nonNull
          case prop.kind === 'StringKeyword':
            b=b.string(prop.name)
            break;
          case prop.type === 'Int':
            b = b.int(prop.name)
            break;
          case prop.kind === 'ArrayType':
            b.list.field(prop.name, {
              type: prop.type,
              ...prop.function && {
                async resolve(root, args, ctx){
                  await models[obj.name][prop.name].bind(root).call(args,ctx)
                }
              }
            })
            break;
          default:
        }
      })
    }
  })
}