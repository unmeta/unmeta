import { Post } from "./Post";
import { Model, Int } from "./index";
function uuid(){
  return "1"
}
export interface Unique<T> {
  unique: T;
}
export interface ID<T>{
}
export class User implements Model {
  id: ID<string> = uuid();
  name?: string;
  email: Unique<string>;

  posts(root, _, ctx): Post {
    return ctx.prisma.user.findFirst({ where: { id: root.id } }).posts();
  }
}
