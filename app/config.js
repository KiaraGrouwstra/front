// the app isn't actually using this yet somehow, though it seems the jasmine thing does.

System.config({
  //use typescript for compilation
  transpiler: 'typescript',
  //typescript compiler options
  typescriptOptions: {
    emitDecoratorMetadata: true
  },
  //map tells the System loader where to look for things
  map: {
    app: "./"
  },
  //packages defines our app package
  packages: {
    app: {
      main: './boot.ts',
      defaultExtension: 'ts'
    }
  }
});
