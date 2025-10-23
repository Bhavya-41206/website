// Theme toggle - moved to left
const toggleBtn = document.getElementById('toggleTheme');
toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    document.body.classList.toggle('light');
    // Update button icon based on theme
    toggleBtn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
});

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', function() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'login.html';
    }
});

// Add tooltips to navigation cards
document.querySelectorAll('.nav-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        const tooltip = this.querySelector('p').textContent;
        this.setAttribute('title', tooltip);
    });
});

// Add tooltip to theme toggle
toggleBtn.addEventListener('mouseenter', function() {
    this.setAttribute('title', 'Toggle Theme');
});

// Add tooltip to logout button
document.getElementById('logoutBtn').addEventListener('mouseenter', function() {
    this.setAttribute('title', 'Logout');
});

// Page switching
function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    
    // Update active nav card
    document.querySelectorAll('.nav-card').forEach(card => {
        card.classList.remove('active');
    });
    // Find the clicked nav card and add active class
    event.currentTarget.classList.add('active');
}

// Show home on load
window.addEventListener('load', function() {
    // Check authentication first
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }
    
    // Then show home page
    showPage('home');
    
    // Initialize first nav card as active
    document.querySelector('.nav-card').classList.add('active');
});

// Chart setup
let ctx = document.getElementById('chart').getContext('2d');
let chart = new Chart(ctx, {
    type: 'line',
    data: { 
        labels: [], 
        datasets: [
            { label: 'Voltage', data: [], borderColor: 'yellow', fill: false },
            { label: 'Current', data: [], borderColor: 'blue', fill: false },
            { label: 'Power', data: [], borderColor: 'green', fill: false },
            { label: 'Energy', data: [], borderColor: 'orange', fill: false },
        ]
    },
    options: { 
        responsive: true, 
        interaction: { mode: 'index', intersect: false }, 
        scales: { 
            x: { 
                display: true, 
                title: { display: true, text: 'Time' } 
            } 
        } 
    }
});

// Fetch readings from backend
async function fetchReadings() {
    try {
        const res = await fetch('/api/readings');
        const data = await res.json();
        
        document.getElementById('voltage').querySelector('span').innerText = `Voltage: ${data.voltage} V`;
        document.getElementById('current').querySelector('span').innerText = `Current: ${data.current} A`;
        document.getElementById('power').querySelector('span').innerText = `Power: ${data.power} W`;
        document.getElementById('energy').querySelector('span').innerText = `Energy: ${data.energy} Wh`;

        // Calculate and display cost (₹6.5 per kWh)
        const energyKwh = data.energy / 1000; // Convert Wh to kWh
        const cost = (energyKwh * 6.5).toFixed(2);
        document.getElementById('cost').querySelector('span').innerText = `Cost: ₹${cost}`;

        const theftBox = document.getElementById('theft');
        theftBox.querySelector('span').innerText = `Theft Detected: ${data.theftDetected ? 'YES' : 'NO'}`;
        theftBox.classList.toggle('alert', data.theftDetected);

        // Update chart
        const time = new Date().toLocaleTimeString();
        if(chart.data.labels.length > 10){
            chart.data.labels.shift();
            chart.data.datasets.forEach(ds => ds.data.shift());
        }
        chart.data.labels.push(time);
        chart.data.datasets[0].data.push(data.voltage);
        chart.data.datasets[1].data.push(data.current);
        chart.data.datasets[2].data.push(data.power);
        chart.data.datasets[3].data.push(data.energy);
        chart.update();
    } catch(err) { 
        console.error('Error fetching readings:', err); 
    }
}

// Start fetching readings
setInterval(fetchReadings, 3000);
fetchReadings();

// Contact form
document.getElementById('sendMsg').addEventListener('click', async () => {
    const message = document.querySelector('#contact textarea').value;
    const username = "User";
    
    if(!message) {
        alert("Please write a message.");
        return;
    }
    
    try {
        const res = await fetch('/api/contact', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ username, message })
        });
        
        const data = await res.json();
        if(data.success){
            alert("Message sent to Government!");
            document.querySelector('#contact textarea').value = '';
        } else {
            alert("Failed to send message.");
        }
    } catch(error) {
        console.error('Error sending message:', error);
        alert("Error sending message.");
    }
});
