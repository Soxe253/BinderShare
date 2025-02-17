async function getCards(){
    try{
        const response = await fetch('/cards');
        const data = await response.json();
        if (!data.cards || !Array.isArray(data.cards)) {
            console.error("Invalid data format: Expected an array in 'cards'");
            return;
        }
        console.log(data);
        const item = document.getElementById('ddcard');
        data.cards.forEach(card => {
            const newElement = document.createElement("p");
            newElement.textContent = `
                name: ${card.name}, 
                Card Number: ${card.cardNumber}, 
                Auto: ${card.auto ? 'Yes' : 'No'}, 
                Variant: ${card.variant || 'N/A'}
                `;
            item.appendChild(newElement);
        });
        
    } catch(e) {
        console.error('error fetching cards', e);
    }
}

getCards();