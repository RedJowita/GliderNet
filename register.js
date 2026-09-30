// Form for submitting data to backend 
const form = document.getElementById('registerForm');

form.addEventListener('submit', function(event) {
  // Prevent TemporaryForm default
  event.preventDefault();

  // Take Input data from form fields
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // 1. Basic Validation: Password matches or not
  if (password !== confirmPassword) {
    alert("Passwords do not match! Please check again.");
    return;
  }

  // 2. Prepare Data for Backend to send
  const userData = {
    username: username,
    email: email,
    password: password
  };

  console.log("Data to send to backend:", userData);

  // To send data to Backend 
  fetch('YOUR_BACKEND_URL_HERE', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  })
  .then(response => response.json())
  .then(data => {
    alert("Registration Successful!");
    window.location.href = "login.html"; // Login Page Redirect
  })
  .catch(error => {
    console.error("Error:", error);
    alert("Something went wrong!");
  });
});