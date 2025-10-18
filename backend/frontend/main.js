const toggleBtn = document.getElementById('toggleTheme');
toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    document.body.classList.toggle('light');
});

document.getElementById('loginBtn').addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const res = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if(data.success){
        document.body.innerHTML = `<h2 style="text-align:center;margin-top:40%;">Logging in...</h2>`;
        setTimeout(() => window.location.href = 'dashboard.html', 1500);
    } else {
        document.getElementById('errorMsg').innerText = data.message;
    }
});
