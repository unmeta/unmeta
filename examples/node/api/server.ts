import { Middleware } from "./middlewares";

export interface ServerType {
  context?: ()=>any;
  playground?: boolean;
  tracing?: boolean;
  introspection?: boolean;
  debug?: boolean;
  cors?: boolean;
  middlewares?: Middleware[]
}

class Server implements ServerType {

}