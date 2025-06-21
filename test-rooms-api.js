// Simple test script to verify rooms API endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api';

async function testRoomsAPI() {
  console.log('🧪 Testing Rooms API Endpoints...\n');

  try {
    // Test 1: Get all rooms
    console.log('1️⃣ Testing GET /api/rooms');
    const allRoomsResponse = await axios.get(`${BASE_URL}/rooms`);
    console.log(`✅ Success: Found ${allRoomsResponse.data.length} rooms`);
    console.log(`   First room: ${allRoomsResponse.data[0]?.roomNumber} - ${allRoomsResponse.data[0]?.roomType}\n`);

    // Test 2: Get popular rooms
    console.log('2️⃣ Testing GET /api/rooms/popular');
    const popularRoomsResponse = await axios.get(`${BASE_URL}/rooms/popular?count=3`);
    console.log(`✅ Success: Found ${popularRoomsResponse.data.popularRooms?.length || 0} popular rooms`);
    if (popularRoomsResponse.data.popularRooms?.length > 0) {
      const firstPopular = popularRoomsResponse.data.popularRooms[0];
      console.log(`   First popular room: Room ${firstPopular.roomNumber || firstPopular._id} (Score: ${firstPopular.score})\n`);
    }

    // Test 3: Test menu items (for comparison)
    console.log('3️⃣ Testing GET /api/menus');
    const menuResponse = await axios.get(`${BASE_URL}/menus`);
    console.log(`✅ Success: Found ${menuResponse.data.length} menu items`);
    console.log(`   First menu item: ${menuResponse.data[0]?.name}\n`);

    // Test 4: Test food recommendations
    console.log('4️⃣ Testing GET /api/food-recommendations/popular');
    const foodRecsResponse = await axios.get(`${BASE_URL}/food-recommendations/popular?count=3`);
    console.log(`✅ Success: Found ${foodRecsResponse.data.popularItems?.length || 0} popular food items`);
    if (foodRecsResponse.data.popularItems?.length > 0) {
      const firstFood = foodRecsResponse.data.popularItems[0];
      console.log(`   First popular food: ${firstFood.name} (Score: ${firstFood.score})\n`);
    }

    console.log('🎉 All API endpoints are working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

// Run the test
testRoomsAPI();
