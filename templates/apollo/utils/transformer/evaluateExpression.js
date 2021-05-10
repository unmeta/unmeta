const jsQuery = require("json-query");

const cache={
}
const log = (res)=>{
  // res && res.length && console.log(res)
  return res
}
function jsonQuery(path, opts, helpers) {
  return jsQuery(path, {
    ...opts,
    locals: {
      ...helpers
    }
  });
}
  
module.exports = function evaluateExpression(field, data, root, helpers) {
  field = field.split("\n").map(line=>line.trim()).join("")
  if(cache[field] && cache[field].data === data){
    return cache[field].result
  }
  const bool = field.startsWith("!");
  if (bool) {
    field = field.slice(1);
  }
  const subExpressions = field.match(/{(.*?)}/g);
  if (subExpressions) {
    subExpressions.forEach(exprStr => {
      const expr = exprStr.match(/{(.*?)}/)[1];
      const replaceWith = evaluateExpression(expr, data, root, helpers)
      field = field.replace(exprStr, replaceWith);
    });
  }
  const inlineExpressions = field
    .match(/\(=(.*?)\)/g)
  if (inlineExpressions) {
    field = inlineExpressions.reduce((newField, match) => {
      const replacement = eval(match.match(/\(=(.*?)\)/)[1])
      return newField.replace(match, replacement)
    }, field)

  }

  const query = field.match(/\(([^()].*?)\)/);
  const evalExpression = field.match(/\)(.*?)$/);
  field = (query && query[1]) || field;
  const isRoot = field.startsWith("$.");
  if (isRoot) {
    field = field.slice(2);
    data = root.$;
  }
  const hasParents = field.match(/\.parent/g);
  let parentQuery
  if (hasParents) {
    parentQuery = field.split(hasParents.join(""));
    field = parentQuery[0];
    parentQuery = parentQuery[1].replace(/\.$/, "");
  }
  const resultData = jsonQuery(field, {
    data
  }, helpers);

  let result = resultData.value;
  if (hasParents && result) {
    let newData
    resultData.parents.reverse()
    const keys = resultData.parents[0].key
    if (Array.isArray(result)) {
      if (hasParents.length === 1) {
        newData = resultData.parents[hasParents.length + 1]
          .value.filter((item, index) => {
            return keys.includes(index)
          })
      } else {
        newData = resultData.parents[hasParents.length].value
      }

    } else {
      newData = resultData.parents[hasParents.length].value[
        resultData.key
      ];
    }
    if (!parentQuery) {
      result = newData
    } else {
      result = evaluateExpression(parentQuery, newData, helpers);
    }

  }
  if (evalExpression) {
    const expr = JSON.stringify(result) + evalExpression[1];
    result = eval(expr);
  } else if (bool) {
    result = false;
  }
  cache[field] = {data, result}

  return log(result);
}