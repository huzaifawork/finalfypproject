// Script to update hardcoded API URLs in frontend files
// Run this after deploying your backend to get the actual URL

const fs = require('fs');
const path = require('path');

// Your backend URL after deployment
const BACKEND_URL = 'https://your-backend-url.vercel.app'; // UPDATE THIS!

// Files that need URL updates
const filesToUpdate = [
  'src/api/orders.js',
  'src/api/recommendations.js', 
  'src/api/rooms.js',
  'src/services/tableRecommendationService.js',
  'src/pages/OrderConfirmation.jsx',
  'src/pages/services/bookingService.js'
];

function updateApiUrls() {
  console.log(`🔄 Updating API URLs to: ${BACKEND_URL}`);
  
  filesToUpdate.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace localhost URLs
      content = content.replace(/http:\/\/localhost:8080/g, BACKEND_URL);
      content = content.replace(/http:\/\/127\.0\.0\.1:8080/g, BACKEND_URL);
      
      fs.writeFileSync(fullPath, content);
      console.log(`✅ Updated: ${filePath}`);
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
    }
  });
  
  console.log('🎉 All API URLs updated!');
  console.log('📝 Remember to rebuild and redeploy your frontend');
}

// Run the update
updateApiUrls();
