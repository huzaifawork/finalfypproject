const fs = require('fs');
const path = require('path');

// Your deployed backend URL
const BACKEND_URL = 'https://finalfypproject-k248prfl1-huzaifas-projects-eabfae35.vercel.app';

// Files to update (focusing on frontend components)
const filesToUpdate = [
  // Pages
  'src/pages/BookingPage.js',
  'src/pages/MenuPage.js',
  'src/pages/OrderFood.jsx',
  'src/pages/OrderTracking.jsx',
  'src/pages/ReserveTable.js',
  'src/pages/TableReservationPage.js',
  'src/pages/TableConfirmationPage.js',
  'src/pages/RoomPage.js',
  'src/pages/Profile.jsx',
  'src/pages/BookForm.js',
  'src/pages/MyBookings.jsx',
  'src/pages/AdminOrders.js',

  // Components - User
  'src/components/User/EditBooking.jsx',
  'src/components/User/EditReservation.jsx',
  'src/components/User/MyBookings.js',
  'src/components/User/MyOrders.jsx',
  'src/components/User/MyReservations.jsx',
  'src/components/User/Profile.jsx',
  'src/components/User/Feedback.jsx',

  // Components - UI
  'src/components/ui/ModernCard.jsx',
  'src/components/RoomDetailsModal.js',
  'src/components/RoomRecommendationExplainer.jsx',

  // Components - Recommendations
  'src/components/recommendations/RecommendationCard.jsx',
  'src/components/recommendations/UserFoodPreferences.jsx',
  'src/components/recommendations/PersonalizedRecommendations.jsx',

  // Components - Orders
  'src/components/orders/Cart.jsx',
  'src/components/orders/Invoice.js',
  'src/components/orders/MenuItemModal.jsx',
  'src/components/orders/MenuList.jsx',
  'src/components/orders/MenuOrder.jsx',

  // Components - Menu
  'src/components/Menu/MostPopularItems.js',

  // Components - Home
  'src/components/home/Tables.js',

  // Components - Bookings
  'src/components/bookings/RoomBooking.jsx',

  // Components - Auth
  'src/components/Auth/Login.js',

  // Components - Admin
  'src/components/Admin/AdminAddTable.js',
  'src/components/Admin/AdminManageBookings.js',
  'src/components/Admin/AdminManageReservations.js',
  'src/components/Admin/AdminUpdateTable.js',
  'src/components/Admin/AdminViewMenus.js',
  'src/components/Admin/AdminViewRooms.js',
  'src/components/Admin/AdminViewTable.js',
  'src/components/Admin/AdminViewTables.js',
  'src/components/Admin/AdminUpdateMenu.js',
  'src/components/Admin/dashboardmodule.js',
  'src/components/Admin/MenuManagement.js',
  'src/components/Admin/RecommendationEvaluation.jsx',
  'src/components/Admin/AdminRoomUpdate.js',
  'src/components/Admin/RoomRecommendationAnalytics.js',
  'src/components/Admin/RoomRecommendationAnalytics.jsx',
  'src/components/Admin/AdminOrders.js',
  'src/components/Admin/SentimentAnalysis.jsx',
  'src/components/Admin/ShiftManagement.js',
  'src/components/Admin/StaffManagement.js',
  'src/components/Admin/StaffScheduling.js',
  'src/components/Admin/UserProfileManagement.js',
  'src/components/Admin/AdminDeleteTable.js',
  'src/components/Admin/AdminDeleteRoom.js',
  'src/components/Admin/AdminDeleteMenu.js',
  'src/components/Admin/AdminAddRoom.js',
  'src/components/Admin/AdminAddMenu.js',
  'src/components/Admin/AddTable.js',
  'src/components/Admin/AddRoom.js'
];

function updateFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace all localhost URLs with the deployed backend URL
    const originalContent = content;
    content = content.replace(/http:\/\/localhost:8080/g, BACKEND_URL);
    content = content.replace(/http:\/\/127\.0\.0\.1:8080/g, BACKEND_URL);
    
    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content);
      console.log(`✅ Updated: ${filePath}`);
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
    }
  } else {
    console.log(`❌ File not found: ${filePath}`);
  }
}

console.log(`🔄 Updating all localhost URLs to: ${BACKEND_URL}\n`);

filesToUpdate.forEach(updateFile);

console.log('\n✅ All files have been processed!');
console.log('\n📝 Next steps:');
console.log('1. Review the changes');
console.log('2. Test your application');
console.log('3. Build and deploy your frontend');
