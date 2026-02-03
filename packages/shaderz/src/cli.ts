#!/usr/bin/env node

import { Command } from 'commander';
import prompts from 'prompts';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';

const program = new Command();

const SHADERS = [
  // WebGL Shaders
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
    name: 'silk-flow',
    title: 'Silk Flow',
    description: 'Smooth silk flow shader',
    file: 'SilkFlowShader'
  },
  {
    name: 'plasma',
    title: 'Plasma',
    description: 'Classic plasma shader',
    file: 'PlasmaShader'
  },
  {
    name: 'plasma-v2',
    title: 'Plasma V2',
    description: 'Enhanced plasma shader with more colors',
    file: 'PlasmaV2Shader'
  },
  {
    name: 'dark-veil',
    title: 'Dark Veil',
    description: 'Mysterious dark veil with blue/purple gradient',
    file: 'DarkVeilShader'
  },
  {
    name: 'liquid-motion',
    title: 'Liquid Motion',
    description: 'Advanced fluid simulation with Three.js',
    file: 'LiquidMotionShader',
    hasCss: true
  },
  {
    name: 'frothy-galaxy',
    title: 'Frothy Galaxy',
    description: 'Galactic frothy effect shader',
    file: 'FrothyGalaxyShader'
  },
  {
    name: 'dark-cloudy',
    title: 'Dark Cloudy',
    description: 'Atmospheric dark cloudy with deep flowing currents',
    file: 'DarkCloudy'
  },
  {
    name: 'electric-storm',
    title: 'Electric Storm',
    description: 'Dramatic electric lightning with multi-branch effects',
    file: 'ElectricStorm'
  },
  {
    name: 'floating-lines',
    title: 'Floating Lines',
    description: 'Floating geometric lines with depth',
    file: 'FloatingLines'
  },
  {
    name: 'gradient-blinds',
    title: 'Gradient Blinds',
    description: 'Venetian blinds effect with gradients',
    file: 'GradientBlinds'
  },
  {
    name: 'lightening',
    title: 'Lightening',
    description: 'Lightning bolt effects with realistic branching',
    file: 'Lightening'
  },
  // Video Shaders
  {
    name: 'glossy-film',
    title: 'Glossy Film',
    description: 'Smooth glossy film with reflective surface',
    file: 'GlossyFilmShader',
    isVideo: true,
    videoFile: 'glossy-film.mp4'
  },
  {
    name: 'nova-silk',
    title: 'Nova Silk',
    description: 'Silky smooth nova with flowing gradients',
    file: 'NovaSilkShader',
    isVideo: true,
    videoFile: 'nova-silk.mp4'
  },
  {
    name: 'abstract-render',
    title: 'Abstract Render',
    description: 'Stunning 3D abstract art render with dynamic shapes',
    file: 'AbstractRenderShader',
    isVideo: true,
    videoFile: 'abstract-render.mp4'
  },
  {
    name: 'cosmic-flow',
    title: 'Cosmic Flow',
    description: 'Mesmerizing cosmic flow animation',
    file: 'CosmicFlowShader',
    isVideo: true,
    videoFile: 'cosmic-flow.mp4'
  },
  {
    name: 'liquid-colors',
    title: 'Liquid Colors',
    description: 'Vibrant liquid colors flowing with smooth transitions',
    file: 'LiquidColorsShader',
    isVideo: true,
    videoFile: 'liquid-colors.mp4'
  },
  {
    name: 'neon-swirl',
    title: 'Neon Swirl',
    description: 'Vibrant neon colors swirling with hypnotic patterns',
    file: 'NeonSwirlShader',
    isVideo: true,
    videoFile: 'neon-swirl.mp4'
  },
  {
    name: 'sci-fi-corridor',
    title: 'Sci-Fi Corridor',
    description: 'Futuristic sci-fi corridor with depth',
    file: 'SciFiCorridorShader',
    isVideo: true,
    videoFile: 'sci-fi-corridor.mp4'
  },
  {
    name: 'tunnel-cube',
    title: 'Tunnel Cube',
    description: 'Hypnotic tunnel made of cubes',
    file: 'TunnelCubeShader',
    isVideo: true,
    videoFile: 'tunnel-cube.mp4'
  },
  {
    name: 'vj-spiral',
    title: 'VJ Spiral',
    description: 'VJ-style spiral animation with psychedelic colors',
    file: 'VjSpiralShader',
    isVideo: true,
    videoFile: 'vj-spiral.mp4'
  },
  {
    name: 'wavy-abstract',
    title: 'Wavy Abstract',
    description: 'Wavy abstract patterns with flowing movements',
    file: 'WavyAbstractShader',
    isVideo: true,
    videoFile: 'wavy-abstract.mp4'
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

      // Copy shader file
      const sourceFile = path.join(__dirname, '..', 'shaders', `${shader.file}.tsx`);
      const targetFile = path.join(componentsDir, `${shader.file}${fileExtension}`);

      await fs.copy(sourceFile, targetFile);

      // Handle CSS files for shaders that need them
      if (shader.hasCss) {
        const sourceCss = path.join(__dirname, '..', 'shaders', 'LiqMotion.css');
        const targetCss = path.join(componentsDir, 'LiqMotion.css');
        await fs.copy(sourceCss, targetCss);
        spinner.succeed(`Added ${chalk.green(shader.title)} (with CSS file)`);
      } else {
        spinner.succeed(`Added ${chalk.green(shader.title)}`);
      }

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
