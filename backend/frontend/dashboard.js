// Theme toggle
const toggleBtn = document.getElementById('toggleTheme');
toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    document.body.classList.toggle('light');
    toggleBtn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
});

// Simple logout - just redirect to login
document.getElementById('logoutBtn').addEventListener('click', function() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = 'login.html';
    }
});

// Add tooltips
document.querySelectorAll('.nav-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        const tooltip = this.querySelector('p').textContent;
        this.setAttribute('title', tooltip);
    });
});

toggleBtn.setAttribute('title', 'Toggle Theme');
document.getElementById('logoutBtn').setAttribute('title', 'Logout');

// Page switching - SIMPLIFIED
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    
    // Show the selected page
    document.getElementById(pageId).style.display = 'block';
    
    // If showing graph page, initialize chart
    if (pageId === 'graph') {
        setTimeout(initChart, 100);
    }
    
    // Update active nav card
    document.querySelectorAll('.nav-card').forEach(card => {
        card.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
}

// Show home page by default when page loads
window.addEventListener('load', function() {
    document.getElementById('home').style.display = 'block';
    // Set first nav card as active
    document.querySelector('.nav-card').classList.add('active');
});

// Chart setup
let chart = null;

// Initialize chart when graph page is shown
function initChart() {
    const ctx = document.getElementById('chart').getContext('2d');
    if (chart) {
        chart.destroy();
    }
    
    chart = new Chart(ctx, {
        type: 'line',
        data: { 
            labels: [], 
            datasets: [
                { 
                    label: 'Voltage (V)', 
                    data: [], 
                    borderColor: '#FFD700', 
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                { 
                    label: 'Current (A)', 
                    data: [], 
                    borderColor: '#007BFF', 
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                { 
                    label: 'Power (W)', 
                    data: [], 
                    borderColor: '#28A745', 
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                { 
                    label: 'Energy (Wh)', 
                    data: [], 
                    borderColor: '#FD7E14', 
                    backgroundColor: 'rgba(253, 126, 20, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
            ]
        },
        options: { 
            responsive: true,
            maintainAspectRatio: false,
            interaction: { 
                mode: 'index', 
                intersect: false 
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Real-time Energy Monitoring',
                    font: {
                        size: 18
                    }
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: { 
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Time',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Values',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    beginAtZero: true
                }
            },
            animation: {
                duration: 0 // Disable animation for real-time updates
            }
        }
    });
}

// Fetch readings from backend
async function fetchReadings() {
    try {
        const res = await fetch('/api/readings');
        const data = await res.json();
        
        console.log('Data received:', data); // Debug log
        
        // Update readings
        document.getElementById('voltage').querySelector('span').textContent = `Voltage: ${data.voltage || 0} V`;
        document.getElementById('current').querySelector('span').textContent = `Current: ${data.current || 0} A`;
        document.getElementById('power').querySelector('span').textContent = `Power: ${data.power || 0} W`;
        document.getElementById('energy').querySelector('span').textContent = `Energy: ${data.energy || 0} Wh`;

        // Calculate and display cost
        const energyKwh = (data.energy || 0) / 1000;
        const cost = (energyKwh * 6.5).toFixed(2);
        document.getElementById('cost').querySelector('span').textContent = `Cost: ₹${cost}`;

        // Update theft detection
        const theftBox = document.getElementById('theft');
        const isTheft = data.theftDetected || false;
        theftBox.querySelector('span').textContent = `Theft Detected: ${isTheft ? 'YES' : 'NO'}`;
        theftBox.classList.toggle('alert', isTheft);

        // Update chart if it exists
        if (chart) {
            const time = new Date().toLocaleTimeString();
            if (chart.data.labels.length > 20) {
                chart.data.labels.shift();
                chart.data.datasets.forEach(ds => ds.data.shift());
            }
            chart.data.labels.push(time);
            chart.data.datasets[0].data.push(data.voltage || 0);
            chart.data.datasets[1].data.push(data.current || 0);
            chart.data.datasets[2].data.push(data.power || 0);
            chart.data.datasets[3].data.push(data.energy || 0);
            chart.update('none'); // Update without animation for performance
        }
    } catch (error) { 
        console.error('Error fetching readings:', error);
    }
}

// Contact form
document.getElementById('sendMsg').addEventListener('click', async () => {
    const message = document.querySelector('#contact textarea').value;
    
    if (!message) {
        alert("Please write a message.");
        return;
    }
    
    try {
        const res = await fetch('/api/contact', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ username: "User", message })
        });
        
        const data = await res.json();
        if (data.success) {
            alert("Message sent to Government!");
            document.querySelector('#contact textarea').value = '';
        } else {
            alert("Failed to send message: " + (data.message || "Unknown error"));
        }
    } catch (error) {
        console.error('Error sending message:', error);
        alert("Error sending message. Please try again.");
    }
});

// Start fetching readings
setInterval(fetchReadings, 3000);
fetchReadings(); // Initial fetch
