import { Command, flags } from '@oclif/command'
import { resolveFrom } from '../utils/resolve'
const pkgUp = require('pkg-up')
const fs = require('fs-extra')
const path = require('path')
const execa = require('execa')
const chokidar = require('chokidar')
// const bin = (package) => {
//   return require.resolve(package)
// }

const watchers: any = {

}
const x = async (script, args, config?: any) => {
  const { stdout: binFolder } = await execa('npm', ['bin'], {
    cwd: __dirname
  })
  let executable = path.join(binFolder, script)
  console.log(executable)
  if (!fs.existsSync(executable)) {
    const { stdout: currentBinFolder } = await execa('npm', ['bin'])
    executable = path.join(currentBinFolder, script)

  }
  console.log('Running ', script, ...args)
  try {
    return await execa(executable, args, { ...config, stdio: 'inherit' });
  } catch (err) {
    console.log(err)
    process.exit(err.exitCode)
  }
}
export default class Dev extends Command {
  static description = 'describe the command here'

  static examples = [
    `$ unmeta dev 
`,
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({ char: 'n', description: 'name to print' }),
    // flag with no value (-f, --force)
    force: flags.boolean({ char: 'f' }),
  }

  static args = [{ name: 'project' }]
  async run() {
    const { args, flags } = this.parse(Dev)
    if (!args.project) {
      const packageJSON = require(pkgUp.sync())
      console.log(packageJSON)
      const cwd = process.cwd()
      const templates = Object.keys(packageJSON.dependencies).filter(name => name.match(/@unmeta-templates\//)).map(name => name.split('/')[1])
      const dist = path.join(cwd, 'dist')
      if (!fs.existsSync(dist)) {
        fs.mkdirSync(dist)
      }
      await Promise.all(templates.map(async (name) => {
        const templatePath = resolveFrom(cwd, `@unmeta-templates/${name}`)
        const templateSrc = path.join(templatePath, 'template')
        const config = require(path.join(templatePath, 'unmeta.config.js'))
        const templateDir = path.join(dist, config.dirname || name)
        if (!fs.existsSync(templateDir)) {
          fs.copySync(templateSrc, templateDir)
          fs.rmdirSync(path.join(templateDir, 'node_modules'), { recursive: true })
          await execa('npm', ['install'], {
            cwd: templateDir,
            stdio: 'inherit'

          })
        }
        if (config.generators) {
          for (const generator of config.generators) {
            watchers[generator.watch] = chokidar.watch(generator.watch, {
              ignored: /(^|[\/\\])\../, // ignore dotfiles
              persistent: true
            });
            console.log('watch', generator.watch)
            watchers[generator.watch]
              .on('add', p =>{
                handleGeneration(generator, p, templateDir)
              })
              .on('change', p => handleGeneration(generator, p, templateDir))
              .on('unlink', p => handleGeneration(generator, p, templateDir));
          }
        }
        return execa('npm', ['run', 'dev'], {
          cwd: templateDir,
          stdio: 'inherit'
        })

      }))
    }
    const name = flags.name ?? 'world'
    this.log(`hello ${name} from ./src/commands/hello.ts`)
    if (args.file && flags.force) {
      this.log(`you input --force and --file: ${args.file}`)
    }
  }
}
let allData = {

}
async function handleGeneration(generator: any, p: any, templateDir: any) {
  const data = await generator.plugin.parse(p)
  allData = data?data.models && data.models.reduce((d, m)=>{
    return {
      ...d,
      [m.type]: d[m.type] ? [...d[m.type].filter(n=>n.name!==m.name), m]:[m]
    }
  },allData):allData
  console.log(data)
  const files = generator.plugin.generate(data)
  console.log("generation",data,files)
  console.log(files)
  // generator.map(files)
  // for (const file of files) {
  //   fs.outputFileSync(path.join(templateDir, file.path), file.code)
  // }
  console.log(allData)
  console.log(`File ${p} has been added`)
}

