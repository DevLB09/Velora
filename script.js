// 1. NAVIGATION
const { createClient } = supabase;
const _supabase = createClient(
    'https://vgvvspnoiwcbmwbuxqyc.supabase.co', 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZndnZzcG5vaXdjYm13YnV4cXljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxODUwMTYsImV4cCI6MjA4Nzc2MTAxNn0.mEeFTe612x7UK9UL_KandwlQ1DG2sClXGBzkUUR5HEY'
);
function goToBuild() {
    window.location.href = "build.html";
}

// 1. DATA & CONFIG
const giftItems = [
    { name: 'Tulip', category: 'flowers', image: 'tulip.png', speciality: 'Velora Favorite' },
    { name: 'Rose', category: 'flowers', image: 'rose.png', speciality: 'Classic Romance' },
    { name: 'Daisy', category: 'flowers', image: 'daisy.png', month: 'April' },
    { name: 'Orchid', category: 'flowers', image: 'orchid.png', speciality: 'Exotic Beauty' },
    { name: 'Lilac', category: 'flowers', image: 'lilac.png', speciality: 'Spring Scent' },
    { name: 'Sunflower', category: 'flowers', image: 'sunflower.png', month: 'August' },
    { name: 'Teddy', category: 'gifts', image: 'teddy.png', speciality: 'Cuddly Friend' },
    { name: 'Chocolate', category: 'gifts', image: 'choco_bar.png', speciality: 'Sweet Treat' },
    { name: 'Hello Kitty', category: 'gifts', image: 'hello_kitty.png',speciality: 'Cute Friend' },
    { name: 'Ferrero', category: 'gifts', image: 'ferrero.png',speciality: 'Yummy Treat' }
];

let flowerCount = 0;
const MAX_FLOWERS = 10;
let selectionTally = {}; 

// 2. NAVIGATION
function goToBuild() { window.location.href = "build.html"; }

// 3. SELECTION MENU & VIEW TOGGLE
function filterItems(category) {
    // Toggle Canvas Views
    const tagOpt = document.getElementById('tag-option-container');
    const drawOpt = document.getElementById('draw-option-container');
    const styleOpt = document.getElementById('style-option-container');

    const nameInput = document.getElementById('name-input');
    const messageInput = document.getElementById('message-input');
    
    if (category === 'flowers') {
        tagOpt.style.display = 'flex';
        styleOpt.style.display = 'flex';
        drawOpt.style.display = 'none';
        nameInput.style.display = 'block';
        messageInput.style.display = 'block';
    } else if (category === 'gifts') {
        tagOpt.style.display = 'none';
        styleOpt.style.display = 'none';
        drawOpt.style.display = 'flex';
        nameInput.style.display = 'none';
        messageInput.style.display = 'none';
    } else {
        // Stickers/others
        tagOpt.style.display = 'none';
        drawOpt.style.display = 'none';
        styleOpt.style.display = 'none';
    }
    const bouquetView = document.getElementById('bouquet-view');
    const boxView = document.getElementById('box-view');
    
    if (category === 'gifts') {
        if(bouquetView) bouquetView.style.display = 'none';
        if(boxView) boxView.style.display = 'flex';
    } else {
        if(bouquetView) bouquetView.style.display = 'flex';
        if(boxView) boxView.style.display = 'none';
    }
    
    
    // Render Menu Cards
    const grid = document.getElementById('items-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const popup = document.getElementById('hover-popup');
    
    const filtered = giftItems.filter(i => i.category === category);
    
    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <img src="assets/${item.image}" alt="${item.name}">
            <span>${item.name}</span>
        `;

        // Hover Tooltip Logic
        card.onmousemove = (e) => {
            if (!popup) return;
            popup.style.display = 'block';
            popup.style.left = (e.clientX + 15) + 'px';
            popup.style.top = (e.clientY + 15) + 'px';
            document.getElementById('popup-name').innerText = item.name;
            document.getElementById('popup-speciality').innerText = item.speciality || "Velora Pick";
            document.getElementById('popup-month').innerText = item.month ? `Birth Month: ${item.month}` : "";
        };
        card.onmouseleave = () => { if (popup) popup.style.display = 'none'; };

        card.onclick = () => addToCanvas(item);
        grid.appendChild(card);
    });
}

// 4. MAIN BUILD LOGIC
function addToCanvas(item) {
    const containerId = (item.category === 'gifts') ? 'box-view' : 'bouquet-view';
    const container = document.getElementById(containerId);
    
    // 1. Box Video Logic
    if (item.category === 'gifts') {
        const boxVideo = document.getElementById('box-video');
        if (boxVideo && boxVideo.paused && boxVideo.currentTime === 0) {
            boxVideo.play();
            boxVideo.onended = () => {
                boxVideo.pause();
                boxVideo.currentTime = boxVideo.duration;
            };
        }
    }

    // 2. Flower Limit Check
    if (item.category === 'flowers' && flowerCount >= MAX_FLOWERS) {
        alert("Your bouquet is full!");
        return;
    }

    const placeholder = document.getElementById('placeholder-text');
    if (placeholder) placeholder.style.display = 'none';

    // 3. Update Tally & Create Image
    selectionTally[item.name] = (selectionTally[item.name] || 0) + 1;
    updateTallyUI();

    const img = document.createElement('img');
    img.src = item.isCustom ? item.image : `assets/${item.image}`;
    img.className = (item.category === 'gifts') ? 'gift-item' : 'placed-item'; 
    if (item.isCustom) img.classList.add('custom-card');

    // Initial position
    img.style.left = '50%';
    img.style.top = '30%';

    // --- UNIFIED POINTER DRAG LOGIC ---
    let isDragging = false;
    let startX, startY;

    const startDrag = (e) => {
        e.preventDefault();
        isDragging = false;

        // Lock the pointer to the item (fixes the "sticky" bug)
        e.target.setPointerCapture(e.pointerId);

        startX = e.clientX - img.offsetLeft;
        startY = e.clientY - img.offsetTop;

        const onMove = (ev) => {
            // Threshold to distinguish between a tap and a drag
            if (Math.abs(ev.clientX - (startX + img.offsetLeft)) > 3 || 
                Math.abs(ev.clientY - (startY + img.offsetTop)) > 3) {
                isDragging = true;
            }

            if (isDragging) {
                let newX = ev.clientX - startX;
                let newY = ev.clientY - startY;
                
                const rect = container.getBoundingClientRect();
                let minX, maxX, minY, maxY;

                // Category-specific boundaries
                if (item.category === 'gifts') {
                    minX = rect.width * 0.1; maxX = rect.width * 0.8;
                    minY = rect.height * 0.2; maxY = rect.height * 0.7;
                } else {
                    minX = rect.width * 0.15; maxX = rect.width * 0.75;
                    minY = rect.height * 0.05; maxY = rect.height * 0.45;
                }

                if (newX >= minX && newX <= maxX) img.style.left = newX + 'px';
                if (newY >= minY && newY <= maxY) img.style.top = newY + 'px';
            }
        };

        const stopDrag = (ev) => {
            e.target.releasePointerCapture(e.pointerId);
            img.removeEventListener('pointermove', onMove);
            img.removeEventListener('pointerup', stopDrag);

            if (!isDragging) { 
                // Removal Logic
                if (selectionTally[item.name] > 0) selectionTally[item.name]--;
                updateTallyUI();
                
                if (item.category === 'flowers') {
                    flowerCount = Math.max(0, flowerCount - 1);
                    updateCounter();
                }
                img.remove();
            }
            isDragging = false;
        };

        img.addEventListener('pointermove', onMove);
        img.addEventListener('pointerup', stopDrag);
    };

    // Attach ONLY this listener
    img.addEventListener('pointerdown', startDrag);
    img.ondragstart = () => false;

    container.appendChild(img);
    if (item.category === 'flowers') { 
        flowerCount++; 
        updateCounter(); 
    }
}

// 5. UI HELPERS
function updateTallyUI() {
    const tallyContainer = document.getElementById('item-tally');
    if (!tallyContainer) return;
    tallyContainer.innerHTML = '';
    for (const [name, count] of Object.entries(selectionTally)) {
        if (count > 0) {
            const badge = document.createElement('span');
            badge.className = 'tally-badge';
            badge.innerText = `${name} x${count}`;
            tallyContainer.appendChild(badge);
        }
    }
}

// --- UPDATED COUNTER LOGIC ---
function updateCounter() {
    const counterDisplay = document.getElementById('current-count');
    if (counterDisplay) counterDisplay.innerText = flowerCount;
    
    const finishBtn = document.getElementById('finish-btn');
    if (finishBtn) {
        // Require at least 6 flowers before enabling the button
        if (flowerCount >= 6) {
            finishBtn.style.backgroundColor = "#2D5A43"; // Velora Green
            finishBtn.style.cursor = "pointer";
            finishBtn.innerText = "Finish & Write Letter";
            finishBtn.disabled = false; // THIS MUST BE FALSE TO WORK
        } else {
            finishBtn.style.backgroundColor = "#ADB9AE";
            finishBtn.style.cursor = "not-allowed";
            finishBtn.innerText = `Add ${6 - flowerCount} more blooms`;
            finishBtn.disabled = true;
        }
    }
}
// Initialize
filterItems('flowers');


// 1. Get references using the IDs from your HTML
const tagToggle = document.getElementById('tag-toggle');
const giftTag = document.getElementById('gift-tag');
const nameInput = document.getElementById('name-input'); // Fixed ID
const msgInput = document.getElementById('message-input'); // Fixed ID

tagToggle.addEventListener('click', () => {
    // Toggle the display
    const isHidden = giftTag.style.display === 'none';
    giftTag.style.display = isHidden ? 'block' : 'none';
    
    // Update the button text
    tagToggle.innerText = isHidden ? 'Hide Tag' : 'Show Tag';

    // Update the tag content with the latest input values
    if (isHidden) {
        document.getElementById('tag-to').innerText = nameInput.value ? `From: ${nameInput.value}` : "From:";
        document.getElementById('tag-msg').innerText = msgInput.value || "Add your text here";
    }
});

// Optional: This makes the tag update LIVE as you type
nameInput.addEventListener('input', () => {
    if (giftTag.style.display === 'block') {
        document.getElementById('tag-to').innerText = nameInput.value ? `From: ${nameInput.value}` : "";
    }
});

msgInput.addEventListener('input', () => {
    if (giftTag.style.display === 'block') {
        document.getElementById('tag-msg').innerText = msgInput.value || "";
    }
});
// drawing canvas thingy
const drawingCanvas = document.getElementById('card-canvas');
const ctx = drawingCanvas ? drawingCanvas.getContext('2d') : null;
let drawing = false;

// Open Modal
function openDrawingModal() {
    document.getElementById('drawing-modal').style.display = 'flex';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#2D5A43'; // Velora Green
}

// Drawing Logic
drawingCanvas.addEventListener('mousedown', () => drawing = true);
drawingCanvas.addEventListener('mouseup', () => { drawing = false; ctx.beginPath(); });
drawingCanvas.addEventListener('mousemove', draw);

function draw(e) {
    if (!drawing) return;
    const rect = drawingCanvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
}

function clearCanvas() { ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height); }
function closeDrawingModal() { document.getElementById('drawing-modal').style.display = 'none'; }

// Save drawing and put it in the Gift Box
function saveCanvasCard() {
    const dataURL = drawingCanvas.toDataURL(); // Converts drawing to an image
    const customItem = {
        name: 'Handmade Card',
        category: 'gifts',
        image: dataURL, // Use the generated data instead of a file path
        isCustom: true
    };
    
    // Use your existing addToCanvas logic!
    addToCanvas(customItem);
    closeDrawingModal();
    clearCanvas();
}
// 1. Helper function to get coordinates regardless of device
function getCoordinates(e) {
    const rect = drawingCanvas.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
        // For Touch (Phones/Tablets)
        return {
            x: e.touches[0].clientX - rect.left,
            y: e.touches[0].clientY - rect.top
        };
    } else {
        // For Mouse
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
}

// 2. Updated Drawing Logic for Mouse
drawingCanvas.addEventListener('mousedown', (e) => {
    drawing = true;
    const coords = getCoordinates(e);
    ctx.moveTo(coords.x, coords.y);
});

drawingCanvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;
    const coords = getCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
});

// 3. NEW: Touch Events for Mobile
drawingCanvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevents the page from scrolling while drawing
    drawing = true;
    const coords = getCoordinates(e);
    ctx.beginPath(); // Start a fresh line
    ctx.moveTo(coords.x, coords.y);
}, { passive: false });

drawingCanvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!drawing) return;
    const coords = getCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
}, { passive: false });

drawingCanvas.addEventListener('touchend', () => {
    drawing = false;
});
// 1. Get references to the new inputs
const colorPicker = document.getElementById('card-color-picker');
const brushSize = document.getElementById('brush-size');

function openDrawingModal() {
    document.getElementById('drawing-modal').style.display = 'flex';
    
    // Set initial values
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    updateBrushSettings();
}

// 2. Function to sync brush with UI
function updateBrushSettings() {
    ctx.strokeStyle = colorPicker.value;
    ctx.lineWidth = brushSize.value;
}

// 3. Update coordinates/drawing to use current settings
function draw(e) {
    if (!drawing) return;
    updateBrushSettings(); // Ensure color/size are current every time we move
    
    const coords = getCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
}

// 4. (Optional) Listen for changes so it feels responsive
colorPicker.addEventListener('input', updateBrushSettings);
brushSize.addEventListener('input', updateBrushSettings);
let isEraser = false;

function toggleEraser() {
    isEraser = !isEraser;
    const eraserBtn = document.getElementById('eraser-btn');
    
    if (isEraser) {
        eraserBtn.classList.add('eraser-active');
        eraserBtn.innerText = "Draw"; // Show they are erasing
    } else {
        eraserBtn.classList.remove('eraser-active');
        eraserBtn.innerText = "Eraser";
    }
}

function updateBrushSettings() {
    if (isEraser) {
        ctx.strokeStyle = "#ffffff"; // Matches the canvas background
        ctx.lineWidth = 25;          // Make eraser thicker than the pen
    } else {
        ctx.strokeStyle = colorPicker.value;
        ctx.lineWidth = brushSize.value;
    }
}

// Ensure clearCanvas turns the eraser off
function clearCanvas() {
    ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    if (isEraser) toggleEraser(); 
}
// Update the Touch Start listener
drawingCanvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); 
    drawing = true;
    
    // CRUCIAL: Sync settings (eraser vs pen) before starting
    updateBrushSettings(); 
    
    const coords = getCoordinates(e);
    ctx.beginPath(); 
    ctx.moveTo(coords.x, coords.y);
}, { passive: false });

// Update the Touch Move listener
drawingCanvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!drawing) return;
    
    // Re-sync just in case the user toggles while drawing
    updateBrushSettings(); 
    
    const coords = getCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
}, { passive: false });

// 1. Define your bouquet styles
const bouquetStyles = [
    { id: 'elegant', name: 'Elegant Chocolate', image: 'bouquet1.png' },
    { id: 'classic', name: 'Classic Mint', image: 'bouquet2.png' },
    { id: 'vintage', name: 'Vintage Blu', image: 'bouquet3.png' },
    { id: 'blush', name: 'Blush Romance', image: 'bouquet4.png' },
    { id: 'golden', name: 'Golden Hour', image: 'bouquet5.png' } ,
    { id: 'timeless', name: 'Timeless Black', image: 'bouquet6.png' },
    { id: 'velvet',name: 'Red Velvet',image: 'bouquet7.png'} // Add more as you like
];

// 2. Open Modal and generate the grid
function openBouquetModal() {
    const modal = document.getElementById('bouquet-modal');
    const grid = document.getElementById('bouquet-options');
    modal.style.display = 'flex';
    
    grid.innerHTML = ''; // Clear old content
    
    bouquetStyles.forEach(style => {
        const option = document.createElement('div');
        option.className = 'bouquet-option-card';
        option.innerHTML = `
            <img src="assets/${style.image}" alt="${style.name}">
            <span>${style.name}</span>
        `;
        option.onclick = () => selectBouquet(style.image);
        grid.appendChild(option);
    });
}

// 3. Close Modal
function closeBouquetModal() {
    document.getElementById('bouquet-modal').style.display = 'none';
}

// 4. Swap the base image
function selectBouquet(imageName) {
    const baseImg = document.getElementById('base-img');
    if (baseImg) {
        baseImg.src = `assets/${imageName}`;
    }
    closeBouquetModal();
}
function finishAndSnapshot() {
    const giftTag = document.getElementById('gift-tag');
    
    // Create the full data object
    const veloraData = {
        bouquetStyle: document.getElementById('base-img').src,
        placedFlowers: Array.from(document.querySelectorAll('.placed-item')).map(img => ({
            src: img.src,
            left: img.style.left,
            top: img.style.top
        })),
        placedGifts: Array.from(document.querySelectorAll('.gift-item')).map(img => ({
            src: img.src,
            left: img.style.left,
            top: img.style.top
        })),
        // This is the part from your screenshot, now placed correctly inside the object
        tag: {
            show: giftTag.style.display === 'block',
            to: document.getElementById('name-input').value,
            msg: document.getElementById('message-input').value,
            left: giftTag.style.left || '50%',
            top: giftTag.style.top || '70%'
        }
    };

    // Save to localStorage
    localStorage.setItem('velora_gift_data', JSON.stringify(veloraData));

    // Move to the next page
    window.location.href = "letter.html";
}