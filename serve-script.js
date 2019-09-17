const { LiveReloadCompiler } = require('@nestjs/ng-universal');

const compiler = new LiveReloadCompiler({
    projectName: 'iq-one-eighty-frontend',
});
compiler.run();
