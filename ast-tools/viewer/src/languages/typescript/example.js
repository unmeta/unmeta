import {
  getAst, getCode
} from "./getAst";
import * as ts from "typescript";

const code = `


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





`;
const q = ([lines])=>{
  console.log(lines.split("\n").map(line=>line.trim()).join(""))
  return lines.split("\n").map(line=>line.trim()).join("")}
export const rules = {
  classes: {
    check: "statements[*kind=245].heritageClauses",
    data: {
      _value: [{
        path: "statements[*kind=245]",
        data: {
          type: "heritageClauses[0].types[0].expression.escapedText",
          name: "name.escapedText",
          decorators: [{
            path: "decorators[*]",
            data: {
              type: "expression.expression.escapedText",
              args: "expression.arguments:code"
            }
          }],
          permission: "decorators[expression.expression.escapedText='permission']:code",
          props: [{
            path: "members[]",
            data: {
              name: "name.escapedText",
              required: "(questionToken.kind) !== 57",
              unique: "(type.typeName.escapedText) === 'Unique'",
              id: "(type.typeName.escapedText) === 'ID'",
              // kind: "type.typeArguments[0].typeName.escapedText|type.typeArguments[0].kind:typescriptKind||type.kind:typescriptKind",
              // type: "type.typeName.escapedText|type.elementType.typeName.escapedText",
              typing: {
                isArray:`
                (
                  type.typeArguments[0].kind:typescriptKind|
                  type.kind:typescriptKind
                )==='ArrayType'`,
                // type: "type",
                isPromise: "(type.typeName.escapedText)==='Promise'",
                type: `type.typeArguments[0].elementType.typeName.escapedText|
                type.typeArguments[0].typeName.escapedText|
                type.elementType.typeName.escapedText|
                type.typeName.escapedText|
                type.kind:typescriptKind`
              },
              description: "$.comments[end>{name.pos}&pos<={name.end}].value",
              function: "(kind) === 161",
              _code: ":code",
              args: "parameters[0].type.typeName.escapedText",
              default: "initializer:code"

            }
          }]
        }
      }]
    },
  },
  interfaces: {
    check: "statements[*kind=246|kind=247]",
    data: {
      _value: [{
        path: "statements[*kind=246|kind=247]",
        data: {
          name: "name.escapedText",
          union: "type.types[*].typeName.escapedText",
          props: [{
            path: "members[]|type.members[]",
            data: {
              name: "name.escapedText",
              required: "(questionToken.kind) !== 57",
              type: "type.typeName.escapedText|type.kind:typescriptKind",
              description: "$.comments[end>{name.pos}&pos<={name.end}].value",
              args: "parameters[0].type.typeName.escapedText",
              default: 'initializer:code'
            }
          }]
        }
      }]
    },
  }, 
  enums: {
    check: "statements[*kind=248]",
    data: {
      _value: [{
        path: "statements[*kind=248]",
        data: {
          name: "name.escapedText",
          props: [{
            path: "members[]|type.members[]",
            data: {
              key: "name.escapedText",
              value: "initializer.text",
            }
          }]
        }
      }]
    }
  },


};
const helpers = {
  typescriptKind: function(input) {
    console.log("typescript");
    return ts.SyntaxKind[input];
  },
  code: function(input){
    console.log(input,"code")
    if(Array.isArray(input)){
      return input.map(i=>getCode(i))
    }
    return input && getCode(input).trim().replace(/^"|"$/g, '')
  }
};
export default {
  ast: getAst(code),
  rules,
  getAst,
  code,
  helpers
};