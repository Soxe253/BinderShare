async function getCards(){//gets and prints all cards attributes to screen
    try{
        const response = await fetch('/cards');
        const data = await response.json();
        if (!Array.isArray(data)) {
            console.error("Invalid data format: Expected an array in 'cards'");
            return;
        }
        console.log(data);
        const item = document.getElementById('cards');
        data.forEach(card => {
            const newElement = document.createElement("p");
            newElement.textContent = `
                name: ${card.name}, 
                Card Number: ${card.cardNumber}, 
                Auto: ${card.auto ? 'Yes' : 'No'}, 
                Variant: ${card.variant || 'N/A'},
                Owner: ${card.owner},
                `;
            item.appendChild(newElement);
        });
        
    } catch(e) {
        console.error('error fetching cards', e);
    }
}

getCards();