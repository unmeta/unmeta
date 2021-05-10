module.exports = {
  dirname: 'api',
  generators: [{
    watch: 'api/**/*.ts',
    plugin: require('./generators/prisma.schema'),
    map: (files) => files
  },
  ]
}