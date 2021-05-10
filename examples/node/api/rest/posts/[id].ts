
const type Req = {
  (req:any, res: any)=>any|Promise<any>;
};
export class Rest {
  get?: (req:any, res: any,client: any)=>|any|Promise<any>;
  post?: (req:any, res: any)=>any;
  put?: (req:any, res: any)=>any;
  patch?: (req:any, res: any)=>any;
  head?: (req:any, res: any)=>any;
  delete?: (req:any, res: any)=>any;
}
class Route {
  ctx: any
  constructor(ctx){
    this.ctx = ctx
  }
}
class Post extends Route implements Rest {
  async get(req, res, client){
    return await client.query({
      mutation: gql`mutation {
          addCompany(input: { displayName: $companyName } ) {
              id
          }
      }`,
      variables: {
        companyName: "aaa"
      }
    })
  }
}