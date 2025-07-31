#!/usr/bin/env node

/**
 * Project Validation Script
 * Validates the SentimentSage project structure and configuration
 */

const fs = require('fs');
const path = require('path');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✓ ${description}`, 'green');
    return true;
  } else {
    log(`✗ ${description} (missing: ${filePath})`, 'red');
    return false;
  }
}

function checkDirectory(dirPath, description) {
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    log(`✓ ${description}`, 'green');
    return true;
  } else {
    log(`✗ ${description} (missing: ${dirPath})`, 'red');
    return false;
  }
}

function checkPackageJson() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Check required scripts
    const requiredScripts = ['dev', 'build', 'preview'];
    let scriptsValid = true;
    
    for (const script of requiredScripts) {
      if (packageJson.scripts && packageJson.scripts[script]) {
        log(`✓ Script "${script}" found`, 'green');
      } else {
        log(`✗ Script "${script}" missing`, 'red');
        scriptsValid = false;
      }
    }
    
    // Check for Vite
    if (packageJson.devDependencies && packageJson.devDependencies.vite) {
      log(`✓ Vite configured`, 'green');
    } else {
      log(`✗ Vite not found in devDependencies`, 'red');
      scriptsValid = false;
    }
    
    return scriptsValid;
  } catch (error) {
    log(`✗ Error reading package.json: ${error.message}`, 'red');
    return false;
  }
}

function checkVercelConfig() {
  try {
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    
    if (vercelConfig.builds && vercelConfig.builds.length > 0) {
      log(`✓ Vercel build configuration found`, 'green');
    } else {
      log(`✗ Vercel build configuration missing`, 'red');
      return false;
    }
    
    if (vercelConfig.routes && vercelConfig.routes.length > 0) {
      log(`✓ Vercel routes configuration found`, 'green');
    } else {
      log(`✗ Vercel routes configuration missing`, 'red');
      return false;
    }
    
    return true;
  } catch (error) {
    log(`✗ Error reading vercel.json: ${error.message}`, 'red');
    return false;
  }
}

function checkBackendStructure() {
  const backendPath = 'backend';
  let backendValid = true;
  
  // Check backend directory structure
  const backendDirs = [
    'routes',
    'models',
    'utils',
    'static'
  ];
  
  for (const dir of backendDirs) {
    if (!checkDirectory(path.join(backendPath, dir), `Backend ${dir} directory`)) {
      backendValid = false;
    }
  }
  
  // Check backend files
  const backendFiles = [
    'app.py',
    'config.py',
    'requirements.txt',
    'README.md'
  ];
  
  for (const file of backendFiles) {
    if (!checkFile(path.join(backendPath, file), `Backend ${file}`)) {
      backendValid = false;
    }
  }
  
  // Check deployment files
  const deploymentFiles = [
    'Procfile',
    'render.yaml',
    'railway.toml'
  ];
  
  for (const file of deploymentFiles) {
    checkFile(path.join(backendPath, file), `Backend deployment file: ${file}`);
  }
  
  return backendValid;
}

function checkEnvironmentFiles() {
  let envValid = true;
  
  // Check frontend .env
  if (checkFile('.env', 'Frontend environment file')) {
    try {
      const envContent = fs.readFileSync('.env', 'utf8');
      if (envContent.includes('VITE_API_BASE_URL')) {
        log(`✓ Frontend API URL configured`, 'green');
      } else {
        log(`✗ VITE_API_BASE_URL not found in .env`, 'red');
        envValid = false;
      }
    } catch (error) {
      log(`✗ Error reading .env: ${error.message}`, 'red');
      envValid = false;
    }
  } else {
    envValid = false;
  }
  
  // Check backend .env.example
  checkFile('backend/.env.example', 'Backend environment template');
  
  return envValid;
}

function main() {
  log('🔍 Validating SentimentSage Project Structure', 'blue');
  log('=' * 50, 'blue');
  
  let allValid = true;
  
  // Check frontend structure
  log('\n📁 Frontend Structure:', 'yellow');
  allValid &= checkDirectory('src', 'Source directory');
  allValid &= checkDirectory('public', 'Public assets directory');
  allValid &= checkFile('index.html', 'Main HTML file');
  allValid &= checkFile('package.json', 'Package configuration');
  allValid &= checkFile('vite.config.ts', 'Vite configuration');
  allValid &= checkFile('tsconfig.json', 'TypeScript configuration');
  allValid &= checkFile('tailwind.config.ts', 'Tailwind configuration');
  allValid &= checkFile('README.md', 'Frontend documentation');
  
  // Check package.json configuration
  log('\n📦 Package Configuration:', 'yellow');
  allValid &= checkPackageJson();
  
  // Check Vercel configuration
  log('\n🚀 Deployment Configuration:', 'yellow');
  allValid &= checkVercelConfig();
  
  // Check backend structure
  log('\n🐍 Backend Structure:', 'yellow');
  allValid &= checkBackendStructure();
  
  // Check environment configuration
  log('\n🔧 Environment Configuration:', 'yellow');
  allValid &= checkEnvironmentFiles();
  
  // Check documentation
  log('\n📚 Documentation:', 'yellow');
  checkFile('DEPLOYMENT.md', 'Deployment guide');
  
  // Final result
  log('\n' + '=' * 50, 'blue');
  if (allValid) {
    log('🎉 Project validation successful! Ready for deployment.', 'green');
    log('\nNext steps:', 'blue');
    log('1. Push to Git repository', 'blue');
    log('2. Deploy frontend to Vercel', 'blue');
    log('3. Deploy backend to your chosen platform', 'blue');
    log('4. Update environment variables', 'blue');
    log('5. Test the deployed application', 'blue');
  } else {
    log('❌ Project validation failed. Please fix the issues above.', 'red');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkFile, checkDirectory, checkPackageJson, checkVercelConfig };