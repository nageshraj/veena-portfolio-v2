#!/usr/bin/env node

/**
 * GitHub Pages Deployment Configuration Checker
 * 
 * This script helps you determine the correct configuration for your GitHub Pages deployment.
 * Run it with: node check-deployment.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 GitHub Pages Deployment Configuration Checker\n');
console.log('=' .repeat(60));

// Check if we're in a git repository
let repoName = '';
let isGitRepo = false;

try {
  const gitConfig = fs.readFileSync('.git/config', 'utf8');
  const urlMatch = gitConfig.match(/url = .*github\.com[:/](.+?)\/(.+?)(\.git)?$/m);
  
  if (urlMatch) {
    isGitRepo = true;
    const username = urlMatch[1];
    repoName = urlMatch[2].replace('.git', '');
    
    console.log('\n✅ Git repository detected');
    console.log(`   Username: ${username}`);
    console.log(`   Repository: ${repoName}`);
    
    // Determine deployment type
    const isRootDomain = repoName === `${username}.github.io`;
    
    console.log('\n📍 Deployment Type:');
    if (isRootDomain) {
      console.log('   ✅ ROOT DOMAIN deployment');
      console.log(`   URL: https://${username}.github.io/`);
      console.log('   Base path: (none needed)');
    } else {
      console.log('   ✅ SUBDIRECTORY deployment');
      console.log(`   URL: https://${username}.github.io/${repoName}/`);
      console.log(`   Base path: /${repoName}`);
    }
    
    // Check current configuration
    console.log('\n⚙️  Current Configuration:');
    
    const nextConfigPath = path.join(__dirname, 'next.config.js');
    if (fs.existsSync(nextConfigPath)) {
      const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
      
      // Check for basePath
      const basePathMatch = nextConfig.match(/basePath:\s*['"`]([^'"`]*)['"`]/);
      const currentBasePath = basePathMatch ? basePathMatch[1] : '';
      
      console.log(`   Current basePath: "${currentBasePath}"`);
      
      if (isRootDomain) {
        if (currentBasePath === '') {
          console.log('   ✅ Configuration is CORRECT for root domain');
        } else {
          console.log('   ⚠️  Configuration needs update!');
          console.log(`   Change basePath to: ""`);
        }
      } else {
        const expectedBasePath = `/${repoName}`;
        if (currentBasePath === expectedBasePath) {
          console.log('   ✅ Configuration is CORRECT for subdirectory');
        } else {
          console.log('   ⚠️  Configuration needs update!');
          console.log(`   Change basePath to: "${expectedBasePath}"`);
        }
      }
    }
    
    // Check for config file
    console.log('\n📄 Configuration File:');
    const configPath = path.join(__dirname, 'public', 'config', 'site-config.json');
    if (fs.existsSync(configPath)) {
      console.log('   ✅ site-config.json found');
      
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log(`   ✅ Valid JSON`);
        console.log(`   Artist: ${config.artist?.name || 'Not set'}`);
        console.log(`   Featured videos: ${config.home?.featuredVideos?.length || 0}`);
        console.log(`   Gallery images: ${config.gallery?.images?.length || 0}`);
      } catch (e) {
        console.log('   ❌ Invalid JSON - please fix syntax errors');
      }
    } else {
      console.log('   ❌ site-config.json NOT found');
      console.log('   Create it at: public/config/site-config.json');
    }
    
    // Check for GitHub Actions workflow
    console.log('\n🤖 GitHub Actions:');
    const workflowPath = path.join(__dirname, '.github', 'workflows', 'deploy.yml');
    if (fs.existsSync(workflowPath)) {
      console.log('   ✅ Deployment workflow found');
    } else {
      console.log('   ❌ Deployment workflow NOT found');
      console.log('   Create it at: .github/workflows/deploy.yml');
    }
    
    // Recommendations
    console.log('\n📋 Next Steps:');
    console.log('   1. Enable GitHub Pages in repository settings');
    console.log('      Settings → Pages → Source: GitHub Actions');
    
    if (!isRootDomain && currentBasePath !== `/${repoName}`) {
      console.log(`   2. Update next.config.js basePath to: "/${repoName}"`);
    }
    
    console.log('   3. Commit and push your changes');
    console.log('   4. Monitor deployment in Actions tab');
    console.log(`   5. Visit your site at: https://${username}.github.io/${isRootDomain ? '' : repoName + '/'}`);
    
  } else {
    console.log('\n⚠️  Could not detect GitHub repository information');
    console.log('   Make sure you have a GitHub remote configured');
  }
} catch (e) {
  console.log('\n⚠️  Not a git repository or no remote configured');
  console.log('   Initialize git and add a GitHub remote first:');
  console.log('   git init');
  console.log('   git remote add origin https://github.com/username/repo-name.git');
}

// Check build output
console.log('\n🏗️  Build Status:');
const outDir = path.join(__dirname, 'out');
if (fs.existsSync(outDir)) {
  console.log('   ✅ Build output exists (out/ directory)');
  
  const configInOut = path.join(outDir, 'config', 'site-config.json');
  if (fs.existsSync(configInOut)) {
    console.log('   ✅ Config file copied to build output');
  } else {
    console.log('   ⚠️  Config file NOT in build output');
    console.log('   Run: npm run build');
  }
} else {
  console.log('   ⚠️  No build output found');
  console.log('   Run: npm run build');
}

console.log('\n' + '='.repeat(60));
console.log('\n💡 For detailed help, see:');
console.log('   - GITHUB_PAGES_SETUP.md (quick setup)');
console.log('   - DEPLOYMENT_GUIDE.md (comprehensive guide)');
console.log('\n');
