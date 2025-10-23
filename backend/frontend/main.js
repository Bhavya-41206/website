// Theme toggle
const toggleBtn = document.getElementById('toggleTheme');
toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    document.body.classList.toggle('light');
});

// Login functionality
document.getElementById('loginBtn').addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');

    // Clear previous errors
    errorMsg.textContent = '';

    // Basic validation
    if (!username || !password) {
        errorMsg.textContent = "Please enter both username and password";
        return;
    }

    try {
        // Show loading state
        const loginBtn = document.getElementById('loginBtn');
        loginBtn.textContent = 'Logging in...';
        loginBtn.disabled = true;

        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await res.json();
        
        if(data.success){
            // Show success message
            document.body.innerHTML = `
                <div style="text-align:center; margin-top:40%;">
                    <h2>Login Successful!</h2>
                    <p>Redirecting to dashboard...</p>
                </div>
            `;
            setTimeout(() => window.location.href = 'dashboard.html', 1000);
        } else {
            errorMsg.textContent = data.message || "Login failed. Please try again.";
            // Reset button
            loginBtn.textContent = 'Login';
            loginBtn.disabled = false;
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMsg.textContent = "Network error. Please check your connection and try again.";
        // Reset button
        document.getElementById('loginBtn').textContent = 'Login';
        document.getElementById('loginBtn').disabled = false;
    }
});

// Allow login with Enter key
document.getElementById('password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('loginBtn').click();
    }
});
