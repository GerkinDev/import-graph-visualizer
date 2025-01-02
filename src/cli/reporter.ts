import fs from 'fs';
import ora from 'ora';
import path from 'path';
import typescript from 'typescript';
import yargs from 'yargs';

export async function createReporterOutput() {
    const {cruise} = await import('dependency-cruiser')
  const args = yargs
    .option('entry-points', {
      alias: 'e',
      demandOption: true,
      array: true,
      string: true,
    })
    .option('ts-config', {
      alias: 't',
      demandOption: false,
      string: true,
    })
    .option('output-path', {
      alias: 'o',
      demandOption: false,
      string: true,
    })
    .option('extensions', {
      demandOption: false,
      string: true,
      array: true
    }).argv;

  const entryPoints = args['entry-points'];
  const tsConfigFileName = args['ts-config'];
  const outputPath = args['output-path'];
  const extensions = args['extensions']?.map((ext: string) => ext.split(',')).flat();

  console.dir({entryPoints, tsConfigFileName, outputPath, extensions})

  const tsConfig =
    tsConfigFileName == null
      ? null
      : typescript.parseJsonConfigFileContent(
          typescript.readConfigFile(tsConfigFileName, typescript.sys.readFile)
            .config,
          typescript.sys,
          path.dirname(tsConfigFileName),
          {},
          tsConfigFileName,
        );

  const cruiseSpinner = ora('Analyzing project imports').start();
  const { output } = await cruise(
    entryPoints,
    {
        doNotFollow: {
          path: 'node_modules',
          dependencyTypes: [
            'npm',
            'npm-dev',
            'npm-optional',
            'npm-peer',
            'npm-bundled',
            'npm-no-pkg',
          ],
        },
        tsPreCompilationDeps: true,
        enhancedResolveOptions: {
            extensions
        },
      },
    undefined,
    {tsConfig},
  );
  cruiseSpinner.succeed('Analyzed project imports');

  const fsSpinner = ora('Creating dependency graph').start();
  fs.writeFileSync(
    path.resolve(__dirname, 'reporter-output.json'),
    JSON.stringify(output),
  );
  if(outputPath){
    fs.copyFileSync(path.resolve(__dirname, 'reporter-output.json'), outputPath);
  }
  fsSpinner.succeed('Created dependency graph');
}

if (require.main === module) {
  createReporterOutput();
}
