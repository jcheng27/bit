import { Environment } from '../environments';
import { Tester } from '../tester';
import { JestExtension } from '../jest';
import { TypescriptExtension } from '../typescript';
import { BuildTask } from '../builder';
import { Compiler, Compile } from '../compiler';
import { WebpackExtension } from '../webpack';
import { DevServer, DevServerContext } from '../bundler';
import webpackConfigFactory from './webpack/webpack.config';
import { Workspace } from '../workspace';

/**
 * a component environment built for [React](https://reactjs.org) .
 */
export class ReactEnv implements Environment {
  constructor(
    /**
     * jest extension
     */
    private jest: JestExtension,

    /**
     * typescript extension.
     */
    private ts: TypescriptExtension,

    /**
     * compiler extension.
     */
    private compiler: Compile,

    /**
     * webpack extension.
     */
    private webpack: WebpackExtension,

    /**
     * workspace extension.
     */
    private workspace: Workspace
  ) {}

  /**
   * returns a component tester.
   */
  getTester(): Tester {
    return this.jest.createTester(require.resolve('./jest/jest.config'));
  }

  /**
   * returns a component compiler.
   */
  getCompiler(): Compiler {
    // eslint-disable-next-line global-require
    const tsConfig = require('./typescript/tsconfig.json');
    return this.ts.createCompiler(tsConfig);
  }

  /**
   * returns and configures the component linter.
   */
  getLinter() {}

  /**
   * returns and configures the React component dev server.
   */
  getDevServer(context: DevServerContext): DevServer {
    const withDocs = Object.assign(context, {
      entry: context.entry.concat([require.resolve('./docs')])
    });

    return this.webpack.createDevServer(withDocs, webpackConfigFactory(this.workspace.path));
  }

  /**
   * return a path to a docs template.
   */
  getDocsTemplate() {
    return require.resolve('./docs');
  }

  /**
   * return a function which mounts a given component to DOM
   */
  getMounter() {
    return require.resolve('./mount');
  }

  /**
   * adds dependencies to all configured components.
   */
  async getDependencies() {
    return {
      dependencies: {
        react: '-'
      },
      // TODO: add this only if using ts
      devDependencies: {
        '@types/react': '^16.9.17'
      },
      // TODO: take version from config
      peerDependencies: {
        react: '^16.12.0'
      }
    };
  }

  /**
   * returns the component build pipeline.
   */
  getPipe(): BuildTask[] {
    // return BuildPipe.from([this.compiler.task, this.tester.task]);
    // return BuildPipe.from([this.tester.task]);
    return [this.compiler.task];
  }
}
