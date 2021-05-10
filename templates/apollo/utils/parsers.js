const ts = require("typescript");
const {forEachComment} = require('tsutils/util/util');
const parse = require('./transformer')
console.log(parse)
const rules = {
  classes: {
    check: "statements[*kind=245].heritageClauses",
    data: {
      _value: [{
        path: "statements[*kind=245]",
        data: {
          filePath: "$.fileName",
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
          fields: [{
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
function getAst(src, fileName) {
  const ast = ts.createSourceFile(
    fileName||"x.ts",
    src,
    ts.ScriptTarget.Latest,
     /*setParentNodes*/ false, ts.ScriptKind.TS
  );
  delete ast.parseDiagnostics;
  const noParentAst = JSON.parse(JSON.stringify(ast));
  const comments = [];
  forEachComment(ast, (_, comment) => {
    if(comment.kind === 3) {
      comment.value = src.substring(comment.pos + 2, comment.end - 2);
    } else {
      comment.value = src.substring(comment.pos + 2, comment.end);
    }
    comments.push(comment);
  });
  return {...noParentAst, comments};
}

function getCode(ast) {
  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
    removeComments: false,
    omitTrailingSemicolon: true
  });

  // Create a source file
  const sourceFile = ts.createSourceFile(
    'someFileName.ts',
    '',
    ts.ScriptTarget.ESNext,
    /*setParentNodes*/ false,
    ts.ScriptKind.TS
  );
  sourceFile.statements = ts.createNodeArray([ast])
  return printer.printFile(sourceFile)
}
const queryTS =(rules,code, fileName)=>{
  const ast = getAst(code, fileName);
  const data = parse(
    ast,
    rules,
    {location:false, helpers: helpers}
    )
    console.log(rules)
    console.log(code,data)
  return data
}


const parsers = {
  parseModels: (code, fileName)=>{
    const res =  queryTS(
     {models: rules.classes},
     code,
     fileName
    )
    const models= res.models && res
    // .models
    // .map(model=>{return {...model}}).filter(({type})=>type==='Model')
    return models
  }
}
    
module.exports = parsers
