// Theme toggle
const toggleBtn = document.getElementById('toggleTheme');
toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    document.body.classList.toggle('light');
});

// Page switching
function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.style.display='none');
    document.getElementById(id).style.display='block';
}

// Show home on load
window.onload = () => showPage('home');

// Chart setup
let ctx = document.getElementById('chart').getContext('2d');
let chart = new Chart(ctx, {
    type: 'line',
    data: { labels: [], datasets: [
        { label: 'Voltage', data: [], borderColor: 'yellow', fill: false },
        { label: 'Current', data: [], borderColor: 'blue', fill: false },
        { label: 'Power', data: [], borderColor: 'green', fill: false },
        { label: 'Energy', data: [], borderColor: 'orange', fill: false },
    ]},
    options: { responsive: true, interaction: { mode: 'index', intersect: false }, scales: { x: { display: true, title: { display: true, text: 'Time' } } } }
});

// Fetch readings from backend
async function fetchReadings() {
    try {
        const res = await fetch('http://localhost:3000/api/readings');
        const data = await res.json();
        document.getElementById('voltage').querySelector('span').innerText = `Voltage: ${data.voltage} V`;
        document.getElementById('current').querySelector('span').innerText = `Current: ${data.current} A`;
        document.getElementById('power').querySelector('span').innerText = `Power: ${data.power} W`;
        document.getElementById('energy').querySelector('span').innerText = `Energy: ${data.energy} Wh`;

        const theftBox = document.getElementById('theft');
        theftBox.querySelector('span').innerText = `Theft Detected: ${data.theftDetected ? 'YES' : 'NO'}`;
        theftBox.classList.toggle('alert', data.theftDetected);

        // Update chart
        const time = new Date().toLocaleTimeString();
        if(chart.data.labels.length > 10){
            chart.data.labels.shift();
            chart.data.datasets.forEach(ds=>ds.data.shift());
        }
        chart.data.labels.push(time);
        chart.data.datasets[0].data.push(data.voltage);
        chart.data.datasets[1].data.push(data.current);
        chart.data.datasets[2].data.push(data.power);
        chart.data.datasets[3].data.push(data.energy);
        chart.update();
    } catch(err){ console.error(err); }
}

setInterval(fetchReadings, 3000);
fetchReadings();

// Contact form
document.getElementById('sendMsg').addEventListener('click', async () => {
    const message = document.querySelector('#contact textarea').value;
    const username = "User"; // Replace with logged-in username
    if(!message) return alert("Please write a message.");
    const res = await fetch('http://localhost:3000/api/contact', {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username,message})
    });
    const data = await res.json();
    if(data.success){
        alert("Message sent to Government!");
        document.querySelector('#contact textarea').value='';
    } else alert("Failed to send message.");
});
