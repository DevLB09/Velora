window.onload = function() {
    const rawData = localStorage.getItem('velora_gift_data');
    if (!rawData) return;

    const data = JSON.parse(rawData);

    // 1. Rebuild Bouquet
    const bouquetContainer = document.getElementById('recreated-bouquet');
    document.getElementById('letter-base-img').src = data.bouquetStyle;

    data.placedFlowers.forEach(f => {
        const img = document.createElement('img');
        img.src = f.src;
        img.style.position = 'absolute';
        img.style.left = f.left;
        img.style.top = f.top;
        img.style.width = '60px'; // Adjust size for preview
        bouquetContainer.appendChild(img);
    });

    // 2. Rebuild Gifts
    const boxContainer = document.getElementById('recreated-box');
    data.placedGifts.forEach(g => {
        const img = document.createElement('img');
        img.src = g.src;
        img.style.position = 'absolute';
        img.style.left = g.left;
        img.style.top = g.top;
        img.style.width = '50px';
        boxContainer.appendChild(img);
    });
};
function saveAndGoToFinal() {
    const letterData = {
        to: document.getElementById('recipient-name').value,
        message: document.getElementById('main-letter-input').value,
        from: document.getElementById('sender-name').value
    };

    if (!letterData.message.trim()) {
        alert("Please write a short message first!");
        return;
    }

    // Add this to our main gift data
    const existingData = JSON.parse(localStorage.getItem('velora_gift_data')) || {};
    existingData.letter = letterData;
    
    localStorage.setItem('velora_gift_data', JSON.stringify(existingData));

    // Move to the final reveal page
    window.location.href = "final.html";
}