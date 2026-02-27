// Add this at the VERY top of your file
const supabaseUrl = 'https://vgvvspnoiwcbmwbuxqyc.supabase.co'; // Your Project URL
const supabaseKey = 'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZndnZzcG5vaXdjYm13YnV4cXljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxODUwMTYsImV4cCI6MjA4Nzc2MTAxNn0...';      // Your Anon Public Key
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);
window.onload = function() {
    // 1. PRIORITIZE URL DATA (The fix for other devices)
    const urlParams = new URLSearchParams(window.location.search);
    const giftParam = urlParams.get('gift');
    let data;

    if (giftParam) {
        try {
            // Decode the shared link data
            const decodedData = decodeURIComponent(escape(atob(giftParam)));
            data = JSON.parse(decodedData);
            console.log("Velora: Loading shared gift from link.");
        } catch (e) {
            console.error("Velora Error: Invalid gift link.");
        }
    }

    // 2. FALLBACK TO LOCAL STORAGE (If no link, load your own creation)
    if (!data) {
        const rawData = localStorage.getItem('velora_gift_data');
        if (!rawData) return;
        data = JSON.parse(rawData);
        console.log("Velora: Loading your creation from local storage.");
    }

    // --- START RENDERING (Using 'data' variable) ---
    
    // 1. Rebuild Bouquet
    const bouquetContainer = document.getElementById('final-bouquet-view');
    const baseImg = document.getElementById('final-base-img');
    if (baseImg) baseImg.src = data.bouquetStyle;

    data.placedFlowers.forEach(flower => {
        const img = document.createElement('img');
        img.src = flower.src;
        img.className = 'placed-item'; 
        img.style.width = "100px"; 
        img.style.position = "absolute"; // Ensure absolute positioning

        img.style.left = String(flower.left).includes('%') || String(flower.left).includes('px') 
                        ? flower.left : flower.left + "px";
        img.style.top = String(flower.top).includes('%') || String(flower.top).includes('px') 
                        ? flower.top : flower.top + "px";

        bouquetContainer.appendChild(img);
    });

    // 2. Tag Logic
    if (data.tag && data.tag.show) {
        const finalTag = document.createElement('div');
        finalTag.className = 'final-tag';
        finalTag.innerHTML = `
            <div style="font-size: 0.7em; margin-bottom: 2px;">From: ${data.tag.to || ''}</div>
            <div style="font-weight: bold;">${data.tag.msg || ''}</div>
        `;
        finalTag.style.position = 'absolute';
        finalTag.style.left = data.tag.left || "50%";
        finalTag.style.top = data.tag.top || "70%";
        finalTag.style.zIndex = "100";
        bouquetContainer.appendChild(finalTag);
    }

    // 3. Rebuild Gift Box
    const boxContainer = document.getElementById('final-box-view');
    if (data.placedGifts && data.placedGifts.length > 0) {
        boxContainer.style.display = 'block';
        data.placedGifts.forEach(gift => {
            const img = document.createElement('img');
            img.src = gift.src;
            img.className = 'gift-item';
            if (gift.src.startsWith('data:image')) img.classList.add('custom-card');
            img.style.left = gift.left;
            img.style.top = gift.top;
            boxContainer.appendChild(img);
        });
    } else {
        boxContainer.style.display = 'none';
    }

    // 4. Populate Letter
    if (data.letter) {
        document.getElementById('display-to').innerText = `Dear ${data.letter.to || 'You'},`;
        document.getElementById('display-message').innerText = data.letter.message || '';
        document.getElementById('display-from').innerText = data.letter.from || '';
    }
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff69b4', '#ff85a2', '#ffb3c1', '#ffffff'] // Velora-themed pinks and whites
    });
};

// --- SHARE LOGIC ---
async function generateShareLink() {
    const rawData = localStorage.getItem('velora_gift_data');
    if (!rawData) return alert("No gift data found!");

    const shareBtn = document.getElementById('share-btn');
    shareBtn.innerText = "UPLOADING...";

    // 1. Send data to Supabase
    const { data, error } = await _supabase
        .from('bouquets')
        .insert([{ bouquet_data: JSON.parse(rawData) }])
        .select();

    if (error) {
        console.error(error);
        return alert("Error saving bouquet!");
    }

    // 2. Create the beautiful short link using the ID from the database
    const bouquetId = data[0].id;
    const shareUrl = `${window.location.origin}${window.location.pathname}?id=${bouquetId}`;

    // 3. Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
        shareBtn.innerText = "LINK COPIED!";
        setTimeout(() => { shareBtn.innerText = "SHARE THIS GIFT"; }, 2000);
    });
}