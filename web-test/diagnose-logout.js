const fs = require('fs');
const path = require('path');

function diagnoseLogoutIssue() {
  console.log('🔍 Diagnosing Web Logout Issue...\n');
  
  // Check if main index.html exists
  const indexPath = path.join(__dirname, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.log('❌ index.html not found!');
    return;
  }
  
  console.log('✅ index.html found');
  
  // Read and analyze the file
  const content = fs.readFileSync(indexPath, 'utf8');
  
  // Check for logout button
  const logoutBtnMatch = content.match(/id="logoutBtn"/);
  console.log(`🔘 Logout button: ${logoutBtnMatch ? '✅ Found' : '❌ Not found'}`);
  
  // Check for logout event listener
  const logoutEventMatch = content.match(/logoutBtn\.addEventListener\('click'/);
  console.log(`🔘 Logout event listener: ${logoutEventMatch ? '✅ Found' : '❌ Not found'}`);
  
  // Check for showLoginForm function
  const showLoginFormMatch = content.match(/function showLoginForm\(\)/);
  console.log(`🔘 showLoginForm function: ${showLoginFormMatch ? '✅ Found' : '❌ Not found'}`);
  
  // Check for localStorage.removeItem
  const localStorageMatch = content.match(/localStorage\.removeItem/g);
  console.log(`🔘 localStorage.removeItem calls: ${localStorageMatch ? `✅ Found ${localStorageMatch.length}` : '❌ Not found'}`);
  
  // Check for hidden class manipulation
  const hiddenClassMatch = content.match(/classList\.(add|remove)\('hidden'\)/g);
  console.log(`🔘 Hidden class manipulation: ${hiddenClassMatch ? `✅ Found ${hiddenClassMatch.length}` : '❌ Not found'}`);
  
  // Extract logout function
  const logoutFunctionMatch = content.match(/logoutBtn\.addEventListener\('click'[^}]+}\);/s);
  if (logoutFunctionMatch) {
    console.log('\n📝 Logout Function Found:');
    console.log('---');
    console.log(logoutFunctionMatch[0].substring(0, 500) + '...');
    console.log('---');
  }
  
  // Check for potential issues
  console.log('\n🔍 Potential Issues:');
  
  // Issue 1: Missing DOM elements
  const domElementsCheck = [
    'getElementById(\'loginForm\')',
    'getElementById(\'userDashboard\')',
    'getElementById(\'logoutBtn\')'
  ];
  
  domElementsCheck.forEach(element => {
    const found = content.includes(element);
    console.log(`   ${element}: ${found ? '✅' : '❌'}`);
  });
  
  // Issue 2: JavaScript errors
  const potentialErrors = [
    'async () =>',
    'try {',
    'catch (error)',
    'finally {'
  ];
  
  console.log('\n🔍 JavaScript Structure:');
  potentialErrors.forEach(pattern => {
    const matches = content.match(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'));
    console.log(`   ${pattern}: ${matches ? `✅ ${matches.length} found` : '❌ Not found'}`);
  });
  
  // Issue 3: CSS classes
  const cssClasses = ['hidden', 'btn', 'btn-danger'];
  console.log('\n🔍 CSS Classes:');
  cssClasses.forEach(className => {
    const found = content.includes(className);
    console.log(`   .${className}: ${found ? '✅' : '❌'}`);
  });
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  console.log('1. Open browser console (F12) and check for JavaScript errors');
  console.log('2. Test the simple logout page: http://localhost:8080/test-logout.html');
  console.log('3. Check if logout button is actually clickable (not covered by other elements)');
  console.log('4. Verify DOM elements are properly loaded before event listeners');
  console.log('5. Test with different browsers (Chrome, Firefox, Edge)');
  
  console.log('\n🧪 Debug Steps:');
  console.log('1. Login to the main app: http://localhost:8080');
  console.log('2. Open browser console (F12)');
  console.log('3. Look for debug messages starting with 🔴, 🔵, 🟢');
  console.log('4. Click logout button and watch console output');
  console.log('5. If no console output, the event listener is not working');
  
  console.log('\n🔧 Quick Fix Test:');
  console.log('Try this in browser console after login:');
  console.log('   localStorage.clear(); location.reload();');
}

diagnoseLogoutIssue();
