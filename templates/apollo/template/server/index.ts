import { server } from './server'
// import {startSSR} from './ssr'
const PORT = process.env.PORT || 4002

// startSSR({});
server.listen({ port: PORT }).then(({ url, subscriptionsUrl }) => {
  console.log(`🚀 Server ready at ${url}`)
  console.log(`🚀 Subscriptions ready at ${subscriptionsUrl}`)
})
