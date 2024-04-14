const canvas = document.getElementById('animated-background');
const ctx = canvas.getContext('2d');
const points = [];
const density = 0.5; // per r x r
const r = 50; // radius for line connections
const speed = 10; // px / s

const gridSize = r;
const grid = {};

function getGridKey(x, y) {
    return `${Math.floor(x / gridSize)}_${Math.floor(y / gridSize)}`;
}

function addToGrid(point) {
    const key = getGridKey(point.x, point.y);
    if (!grid[key]) {
        grid[key] = [];
    }
    grid[key].push(point);
}

function removeFromGrid(point) {
    const key = getGridKey(point.x, point.y);
    if (grid[key]) {
        grid[key] = grid[key].filter(p => p !== point);
    }
}

function updateGrid() {
    for (const key in grid) {
        grid[key] = [];
    }
    points.forEach(point => {
        addToGrid(point);
    });
}

var lastTime = Date.now();
function animate() {
    // Set the canvas size to fill the window
    resize();

    const time = Date.now();
    let dt = Math.min(lastTime - time, 1000) / 1000;

    lastTime = time;

    // ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateGrid();

    points.forEach(point => {
        // Move point
        point.x += point.vx * dt;
        point.y += point.vy * dt;

        // Wrap around the edges
        if (point.x > canvas.width) point.x = 0;
        if (point.y > canvas.height) point.y = 0;
        if (point.x < 0) point.x = canvas.width;
        if (point.y < 0) point.y = canvas.height;
    });

    
    // ctx.strokeStyle = '#ddd';
    // ctx.beginPath();
    // points.forEach(point => {
    //     // Draw lines to nearby points
    //     const key = getGridKey(point.x, point.y);
    //     const neighbors = getNearbyPoints(key);
    //     neighbors.forEach(nearPoint => {
    //         const dx = point.x - nearPoint.x;
    //         const dy = point.y - nearPoint.y;
    //         const distance = Math.sqrt(dx * dx + dy * dy);
    //         if (distance < r) {
    //             ctx.moveTo(point.x, point.y);
    //             ctx.lineTo(nearPoint.x, nearPoint.y);
    //         }
    //     });
    // });
    // ctx.stroke();
    
    points.forEach(point => {
        // Draw lines to nearby points
        const key = getGridKey(point.x, point.y);
        const neighbors = getNearbyPoints(key);
        neighbors.forEach(nearPoint => {
            const dx = point.x - nearPoint.x;
            const dy = point.y - nearPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < r) {
                ctx.strokeStyle = `rgba(180,180,180,${1 - distance/r})`;

                // ctx.strokeStyle = '#ddd';
                ctx.beginPath();
                ctx.moveTo(point.x, point.y);
                ctx.lineTo(nearPoint.x, nearPoint.y);
                ctx.stroke();
            }

        });
    });

    ctx.fillStyle = 'hotpink';
    ctx.beginPath();
    points.forEach(point => {
        // Draw point
        ctx.moveTo(point.x, point.y);
        ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
    });
    
    ctx.fill();

    requestAnimationFrame(animate);
}

function getNearbyPoints(key) {
    const [gridX, gridY] = key.split('_').map(Number);
    const neighbors = [];

    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            const neighborKey = getGridKey((gridX + x) * gridSize, (gridY + y) * gridSize);
            if (grid[neighborKey]) {
                neighbors.push(...grid[neighborKey]);
            }
        }
    }

    return neighbors;
}

function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let area = canvas.width * canvas.height / (r * r); 
    
    while ( points.length / area < density ) {
        // Initialize points with random positions and velocities
        const point = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 2 * speed,
            vy: (Math.random() - 0.5) * 2 * speed
        };
        points.push(point);
    }

    while ( (points.length - 1) / area > density ) {
        points.pop();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Start the animation
    animate();
});