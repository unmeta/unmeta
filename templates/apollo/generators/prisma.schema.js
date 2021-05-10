async function parse(file){
  const fs = require('fs')
  console.log(file)
  const parsers = require('../utils/parsers')
  console.log(parsers)
  const code = fs.readFileSync(file).toString()
  return parsers.parseModels(code, file)
}

function generate(data){
  // return data ? data.map(model=>{
  //   return {
  //     path: `db/${model.name}`,
  //     code: JSON.stringify(model)
  //   }
  // }):[]
}

module.exports = {
  parse,
  generate
}