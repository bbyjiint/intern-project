// import fetch from 'node-fetch'; // Using global fetch


async function testApi() {
  try {
    console.log('Testing API connection to http://localhost:5000/api/universities...');
    const response = await fetch('http://localhost:5000/api/universities');
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ API Response received');
    
    if (data.universities) {
      console.log(`✅ Found ${data.universities.length} universities via API.`);
      if (data.universities.length > 0) {
        console.log('Sample university:', data.universities[0]);
      }
    } else {
      console.log('⚠️ Unexpected response format:', data);
    }

  } catch (error: any) {
    console.error('❌ API Test Failed:', error.message);
    console.log('Make sure the backend server is running (npm run dev in backend folder).');
  }
}

testApi();
