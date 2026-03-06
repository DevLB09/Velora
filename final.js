// ==============================
//  SUPABASE CONFIG
// ==============================
const SUPABASE_URL = "https://gksfqakvvyuxrnohwggd.supabase.co";   // 🔁 replace this
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdrc2ZxYWt2dnl1eHJub2h3Z2dkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NTUxNTYsImV4cCI6MjA4ODEzMTE1Nn0.JipxoMOAilhRjjCxKkq5ujQcoZUG3otDaDkvApGGUAI";            // 🔁 replace this

const SUPABASE_HEADERS = {
    "Content-Type": "application/json",
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
};

// ==============================
//  VELORA MAP (unchanged)
// ==============================
const veloraMap = {
    "r": "assets/rose.png",
    "s": "assets/sunflower.png",
    "t": "assets/tulip.png",
    "d": "assets/daisy.png",
    "l": "assets/lilac.png",
    "c": "assets/clematis.png",
    "h": "assets/hellebore.png",
    "h2": "assets/hibiscus.png",
    "l2": "assets/lily.png",
    "p": "assets/plumeria.png",
    "pr": "assets/purple_rose.png",
    "wl": "assets/white_lily.png",
    "g1": "assets/choco_bar.png",
    "g2": "assets/teddy.png",
    "g3": "assets/hello_kitty.png",
    "g4": "assets/ferrero.png",
    "g5": "assets/kinder.png",
    "g6": "assets/hot_wheels.png",
    "g7": "assets/labubu.png",
    "g8": "assets/necklace.png",
    "g9": "assets/bracelet.png",
    "b1": "assets/bouquet1.png",
    "b2": "assets/bouquet2.png",
    "b3": "assets/bouquet3.png",
    "b4": "assets/bouquet4.png",
    "b5": "assets/bouquet5.png",
    "b6": "assets/bouquet6.png",
    "b7": "assets/bouquet7.png"
};

// ==============================
//  ON LOAD
// ==============================
window.onload = async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const bouquetId = urlParams.get('id');
    let data;

    if (bouquetId) {
        // Load from Supabase using the UUID in the URL
        try {
            const res = await fetch(
                `${SUPABASE_URL}/rest/v1/bouquet?id=eq.${bouquetId}&select=data`,
                { headers: SUPABASE_HEADERS }
            );
            const rows = await res.json();
            if (!rows.length) throw new Error("Not found");
            data = rows[0].data;
            console.log("Velora: Loaded shared bouquet from Supabase.");
        } catch (e) {
            console.error("Velora Error: Could not load bouquet.", e);
            return;
        }
    } else {
        // Creator's own view — load from localStorage
        const rawData = localStorage.getItem('velora_gift_data');
        if (!rawData) return;
        data = JSON.parse(rawData);
        console.log("Velora: Loaded from local storage.");
    }

    renderBouquet(data);
};

// ==============================
//  SHARE LOGIC
// ==============================
async function generateShareLink() {
    const rawData = localStorage.getItem('velora_gift_data');
    if (!rawData) return alert("No gift data found to share!");

    const shareBtn = document.getElementById('share-btn');
    shareBtn.innerText = "GENERATING...";

    try {
        // POST bouquet data to Supabase, get back the UUID
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/bouquet`,
            {
                method: "POST",
                headers: { ...SUPABASE_HEADERS, "Prefer": "return=representation" },
                body: JSON.stringify({ data: JSON.parse(rawData) })
            }
        );

        if (!res.ok) throw new Error("Save failed");

        const rows = await res.json();
        const id = rows[0].id;

        const shareUrl = `${window.location.origin}${window.location.pathname}?id=${id}`;
        await navigator.clipboard.writeText(shareUrl);

        shareBtn.innerText = "LINK COPIED!";
        setTimeout(() => { shareBtn.innerText = "SHARE THIS GIFT"; }, 2000);
        console.log("Velora: Share URL →", shareUrl);

    } catch (err) {
        console.error("Velora Error:", err);
        shareBtn.innerText = "SHARE THIS GIFT";
        alert("Couldn't generate link. Try again!");
    }
}

// ==============================
//  RENDER (unchanged from yours)
// ==============================
function renderBouquet(data) {
    const bouquetContainer = document.getElementById('final-bouquet-view');
    const baseImg = document.getElementById('final-base-img');

    if (baseImg) baseImg.src = veloraMap[data.bouquetStyle] || data.bouquetStyle;

    data.placedFlowers.forEach(flower => {
        const img = document.createElement('img');
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

    const boxContainer = document.getElementById('final-box-view');
    if (data.placedGifts && data.placedGifts.length > 0) {
        boxContainer.style.display = 'block';
        data.placedGifts.forEach(gift => {
            const img = document.createElement('img');
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
}