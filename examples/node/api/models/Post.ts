import { Model, Int } from "./index";
import { User } from "./User";

export class Post implements Model {
  id: Int;
  published: boolean;
  title: string;
  content?: {
    type: string;
    length: 100;
  };
  author(root, _, ctx): User {
    return ctx.prisma.post.findFirst({ where: { id: root.id } }).author();
  }
}
export enum Sort {
  ASC='asc',
  
  DESC='desc'
}