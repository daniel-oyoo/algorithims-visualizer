function setupCollapsibleCards() {
    const approachCards = document.querySelectorAll('.approach-card');

    approachCards.forEach(card => {
        const header = card.querySelector('h4');
        if (header) {
            header.addEventListener('click', function() {
                // Close all other cards
                approachCards.forEach(otherCard => {
                    if (otherCard !== card) {
                        otherCard.classList.remove('expanded');
                    }
                });
                // Toggle this card
                card.classList.toggle('expanded');
            });
        }
    });
}