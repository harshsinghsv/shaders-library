#!/usr/bin/env node

import { Command } from 'commander';
import prompts from 'prompts';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';

const program = new Command();

const SHADERS = [
  { 
    name: 'liquid-orange',
    title: 'Liquid Orange',
    description: 'Flowing liquid shader with warm orange tones',
    file: 'LiquidOrangeShader'
  },
  { 
    name: 'ocean-waves',
    title: 'Ocean Waves',
    description: 'Dynamic ocean waves shader',
    file: 'OceanWavesShader'
  },
  { 
    name: 'neon-fluid',
    title: 'Neon Fluid',
    description: 'Vibrant neon fluid shader',
    file: 'NeonFluidShader'
  },
  { 
    name: 'gradient-waves',
    title: 'Gradient Waves',
    description: 'Smooth gradient waves shader',
    file: 'GradientWavesShader'
  },
  { 
    name: 'cosmic-nebula',
    title: 'Cosmic Nebula',
    description: 'Space-themed nebula shader',
    file: 'CosmicNebulaShader'
  },
  { 
    name: 'glossy-ribbon',
    title: 'Glossy Ribbon',
    description: 'Glossy ribbon flow shader',
    file: 'GlossyRibbonShader'
  },
  { 
    name: 'silk-flow',
    title: 'Silk Flow',
    description: 'Smooth silk flow shader',
    file: 'SilkFlowShader'
  },
  { 
    name: 'glass-twist',
    title: 'Glass Twist',
    description: 'Glass twist effect shader',
    file: 'GlassTwistShader'
  },
  { 
    name: 'plasma',
    title: 'Plasma',
    description: 'Classic plasma shader',
    file: 'PlasmaShader'
  },
  { 
    name: 'glossy-film',
    title: 'Glossy Film (Video)',
    description: 'MP4 video background shader',
    file: 'VideoBackground',
    isVideo: true,
    videoFile: 'glossy-film.mp4'
  }
];

async function addShaders() {
  console.log(chalk.bold.cyan('\n✨ Welcome to Shaderz!\n'));

  const response = await prompts({
    type: 'multiselect',
    name: 'shaders',
    message: 'Select shaders to add to your project:',
    choices: SHADERS.map(shader => ({
      title: `${shader.title} - ${chalk.gray(shader.description)}`,
      value: shader.name,
      selected: false
    })),
    hint: '- Space to select. Return to submit'
  });

  if (!response.shaders || response.shaders.length === 0) {
    console.log(chalk.yellow('No shaders selected. Exiting.'));
    process.exit(0);
  }

  const targetDir = process.cwd();
  
  // Detect project structure and file extension
  const possiblePaths = [
    'src/components',
    'app/components', 
    'components',
  ];

  let componentsBase = '';
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(path.join(targetDir, possiblePath))) {
      componentsBase = possiblePath;
      break;
    }
  }

  // If no components directory found, check for src/ or app/ and create there
  if (!componentsBase) {
    if (fs.existsSync(path.join(targetDir, 'src'))) {
      componentsBase = 'src/components';
    } else if (fs.existsSync(path.join(targetDir, 'app'))) {
      componentsBase = 'app/components';
    } else {
      componentsBase = 'components';
    }

    console.log(chalk.yellow(`\nNo components directory found. Will create: ${componentsBase}/shaders/`));
    const { createDir } = await prompts({
      type: 'confirm',
      name: 'createDir',
      message: 'Continue?',
      initial: true
    });

    if (!createDir) {
      console.log(chalk.red('Installation cancelled.'));
      process.exit(1);
    }
  }

  const componentsDir = path.join(targetDir, componentsBase, 'shaders');
  const publicVideosDir = path.join(targetDir, 'public', 'videos');

  // Detect TypeScript vs JavaScript
  const useTypeScript = fs.existsSync(path.join(targetDir, 'tsconfig.json'));
  const fileExtension = useTypeScript ? '.tsx' : '.jsx';

  // Create shaders directory
  await fs.ensureDir(componentsDir);

  const spinner = ora('Installing shaders...').start();

  try {
    for (const shaderName of response.shaders) {
      const shader = SHADERS.find(s => s.name === shaderName);
      if (!shader) continue;

      // Handle video shaders
      if (shader.isVideo && shader.videoFile) {
        // Create public/videos directory
        await fs.ensureDir(publicVideosDir);
        
        // Copy video file
        const sourceVideo = path.join(__dirname, '..', 'videos', shader.videoFile);
        const targetVideo = path.join(publicVideosDir, shader.videoFile);
        await fs.copy(sourceVideo, targetVideo);
        
        spinner.succeed(`Added ${chalk.green(shader.title)} (video copied to public/videos/)`);
        spinner.start();
      }

      const sourceFile = path.join(__dirname, '..', 'shaders', `${shader.file}.tsx`);
      const targetFile = path.join(componentsDir, `${shader.file}${fileExtension}`);

      await fs.copy(sourceFile, targetFile);
      spinner.succeed(`Added ${chalk.green(shader.title)}`);
      spinner.start();
    }

    spinner.stop();
    console.log(chalk.bold.green('\n✅ Shaders installed successfully!\n'));
    console.log(chalk.gray('Location:'), chalk.cyan(`${componentsBase}/shaders/\n`));
    console.log(chalk.bold('Usage:'));
    response.shaders.forEach((shaderName: string) => {
      const shader = SHADERS.find(s => s.name === shaderName);
      if (shader) {
        console.log(chalk.gray(`  import ${shader.file} from '@/${componentsBase}/shaders/${shader.file}';`));
        if (shader.isVideo) {
          console.log(chalk.gray(`  // Video file: /videos/${shader.videoFile}`));
        }
      }
    });
    console.log('');

    // Check if three is installed
    const packageJsonPath = path.join(targetDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      const hasThree = packageJson.dependencies?.three || packageJson.devDependencies?.three;

      if (!hasThree) {
        console.log(chalk.yellow('⚠️  Required dependency not found!\n'));
        console.log(chalk.gray('Install it with:\n'));
        console.log(chalk.cyan('  npm install three @types/three'));
        console.log(chalk.gray('  or'));
        console.log(chalk.cyan('  pnpm add three @types/three\n'));
      }
    }

  } catch (error) {
    spinner.fail('Failed to install shaders');
    console.error(chalk.red(error));
    process.exit(1);
  }
}

program
  .name('shaderz')
  .description('CLI to add beautiful WebGL shaders to your project')
  .version('1.0.0');

program
  .command('add')
  .description('Add shaders to your project')
  .action(addShaders);

program.parse();
