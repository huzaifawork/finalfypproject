const fs = require('fs');
const path = require('path');

// Your deployed backend URL
const BACKEND_URL = 'https://finalfypproject-k248prfl1-huzaifas-projects-eabfae35.vercel.app';

// Function to recursively find all JS and JSX files
function findJSFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findJSFiles(filePath, fileList);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace all localhost URLs with the deployed backend URL
    content = content.replace(/http:\/\/localhost:8080/g, BACKEND_URL);
    content = content.replace(/http:\/\/127\.0\.0\.1:8080/g, BACKEND_URL);
    
    // Also replace any hardcoded localhost references in template literals
    content = content.replace(/`http:\/\/localhost:8080/g, `\`${BACKEND_URL}`);
    content = content.replace(/\$\{.*\}\/localhost:8080/g, `\${API_BASE_URL}`);
    
    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated: ${path.relative(process.cwd(), filePath)}`);
      return true;
    }
    return false;
  } catch (error) {
    console.log(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

console.log(`🔄 Scanning for all JS/JSX files with localhost URLs...\n`);
console.log(`🎯 Target URL: ${BACKEND_URL}\n`);

// Find all JS/JSX files in src directory
const srcDir = path.join(__dirname, 'src');
const allFiles = findJSFiles(srcDir);

console.log(`📁 Found ${allFiles.length} JS/JSX files to check\n`);

let updatedCount = 0;
allFiles.forEach(filePath => {
  if (updateFile(filePath)) {
    updatedCount++;
  }
});

console.log(`\n✅ Process completed!`);
console.log(`📊 Updated ${updatedCount} files out of ${allFiles.length} total files`);
console.log('\n📝 Next steps:');
console.log('1. Review the changes');
console.log('2. Test your application locally');
console.log('3. Build and deploy your frontend');
console.log('4. Verify all API calls work with the deployed backend');
