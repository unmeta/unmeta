import * as ts from "typescript";
import {forEachComment} from 'tsutils/util/util';

export function getAst(src) {
  const ast = ts.createSourceFile(
    "x.ts",
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

export function getCode(ast) {
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