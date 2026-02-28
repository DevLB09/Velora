const veloraMap = {
    // Flowers
    "r": "assets/rose.png",
    "s": "assets/sunflower.png",
    "t": "assets/tulip.png",
    "d": "assets/daisy.png",
    "l": "assets/lilac.png",
    // Gifts
    "g1": "assets/chocolate.png",
    "g2": "assets/teddy.png",
    "g3": "assets/hello_kitty.png",
    "g4": "assets/ferrero.png",
    // Bouquet Bases
    "b1": "assets/bouquet1.png",
    "b2": "assets/bouquet2.png",
    "b3": "assets/bouquet3.png",
    "b4": "assets/bouquet4.png",
    "b5": "assets/bouquet5.png",
    "b6": "assets/bouquet6.png",
    "b7": "assets/bouquet7.png"
};

window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const giftParam = urlParams.get('gift');
    let data;

    if (giftParam) {
        try {
            const decodedData = decodeURIComponent(escape(atob(giftParam)));
            data = JSON.parse(decodedData);
            console.log("Velora: Loading shared gift from link.");
        } catch (e) {
            console.error("Velora Error: Invalid gift link.");
        }
    }

    if (!data) {
        const rawData = localStorage.getItem('velora_gift_data');
        if (!rawData) return;
        data = JSON.parse(rawData);
        console.log("Velora: Loading your creation from local storage.");
    }

    // --- START RENDERING ---
    
    // 1. Rebuild Bouquet
    const bouquetContainer = document.getElementById('final-bouquet-view');
    const baseImg = document.getElementById('final-base-img');
    
    // UPDATED: Use map for the bouquet base
    if (baseImg) baseImg.src = veloraMap[data.bouquetStyle] || data.bouquetStyle;

    data.placedFlowers.forEach(flower => {
        const img = document.createElement('img');
        
        // UPDATED: Use map for flowers
        img.src = veloraMap[flower.src] || flower.src;
        
        img.className = 'placed-item'; 
        img.style.width = "100px"; 
        img.style.position = "absolute";

        img.style.left = String(flower.left).includes('%') || String(flower.left).includes('px') 
                        ? flower.left : flower.left + "px";
        img.style.top = String(flower.top).includes('%') || String(flower.top).includes('px') 
                        ? flower.top : flower.top + "px";

        bouquetContainer.appendChild(img);
    });

    // 2. Tag Logic (No changes needed here)
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
            
            // UPDATED: Use map for gifts (handles 'g1' vs 'data:image')
            img.src = veloraMap[gift.src] || gift.src;
            
            img.className = 'gift-item';
            if (gift.src.startsWith('data:image')) img.classList.add('custom-card');
            img.style.left = gift.left;
            img.style.top = gift.top;
            boxContainer.appendChild(img);
        });
    } else {
        boxContainer.style.display = 'none';
    }

    // 4. Letter (No changes needed here)
    if (data.letter) {
        document.getElementById('display-to').innerText = `Dear ${data.letter.to || 'You'},`;
        document.getElementById('display-message').innerText = data.letter.message || '';
        document.getElementById('display-from').innerText = data.letter.from || '';
    }

    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff69b4', '#ff85a2', '#ffb3c1', '#ffffff']
    });
};

// --- SHARE LOGIC (The "Compressor") ---
function generateShareLink() {
    const rawData = localStorage.getItem('velora_gift_data');
    if (!rawData) return alert("No gift data found to share!");

    // This converts the already-shortened data into the URL string
    const encodedData = btoa(unescape(encodeURIComponent(rawData)));
    const shareUrl = `${window.location.origin}${window.location.pathname}?gift=${encodedData}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
        const shareBtn = document.getElementById('share-btn');
        if (shareBtn) {
            shareBtn.innerText = "LINK COPIED!";
            setTimeout(() => { shareBtn.innerText = "SHARE THIS GIFT"; }, 2000);
        }
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert("Couldn't copy automatically.");
    });
}