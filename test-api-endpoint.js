// Test script for the relay API endpoint
const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000/api/relay-tip';

// Test cases
const testCases = [
  {
    name: 'Valid tip request',
    data: {
      fan: '0x1234567890123456789012345678901234567890',
      creator: '0x0987654321098765432109876543210987654321',
      amount: '1.5',
      nonce: 0,
      signature: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12'
    },
    expectedStatus: 400 // Will fail signature verification, but should pass validation
  },
  {
    name: 'Missing fan field',
    data: {
      creator: '0x0987654321098765432109876543210987654321',
      amount: '1.5',
      nonce: 0,
      signature: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12'
    },
    expectedStatus: 400
  },
  {
    name: 'Invalid amount (negative)',
    data: {
      fan: '0x1234567890123456789012345678901234567890',
      creator: '0x0987654321098765432109876543210987654321',
      amount: '-1',
      nonce: 0,
      signature: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12'
    },
    expectedStatus: 400
  },
  {
    name: 'Invalid amount (too large)',
    data: {
      fan: '0x1234567890123456789012345678901234567890',
      creator: '0x0987654321098765432109876543210987654321',
      amount: '10000',
      nonce: 0,
      signature: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12'
    },
    expectedStatus: 400
  },
  {
    name: 'Invalid fan address',
    data: {
      fan: 'invalid_address',
      creator: '0x0987654321098765432109876543210987654321',
      amount: '1.5',
      nonce: 0,
      signature: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12'
    },
    expectedStatus: 400
  },
  {
    name: 'GET request (should fail)',
    method: 'GET',
    expectedStatus: 405
  }
];

async function testEndpoint() {
  console.log('Testing relay API endpoint...\n');
  
  for (const testCase of testCases) {
    try {
      const options = {
        method: testCase.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      };
      
      if (testCase.data) {
        options.body = JSON.stringify(testCase.data);
      }
      
      const response = await fetch(API_URL, options);
      const responseData = await response.json();
      
      const passed = response.status === testCase.expectedStatus;
      console.log(`${testCase.name}: ${passed ? 'PASS' : 'FAIL'}`);
      console.log(`  Expected status: ${testCase.expectedStatus}, Got: ${response.status}`);
      console.log(`  Response: ${JSON.stringify(responseData, null, 2)}`);
      console.log('');
      
    } catch (error) {
      console.log(`${testCase.name}: ERROR`);
      console.log(`  Error: ${error.message}`);
      console.log('');
    }
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/relay-tip', {
      method: 'GET'
    });
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('Server is not running. Please start the development server with:');
    console.log('npm run dev');
    console.log('\nThen run this test script again.');
    return;
  }
  
  await testEndpoint();
}

main().catch(console.error);