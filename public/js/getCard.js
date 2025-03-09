async function getCards(){//gets and puts all cards in a dropdown
    try{
        const response = await fetch('/cards');
        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error fetching cards: ', error);
    }
}

async function gotCards(){
    const data = await getCards();
    console.log(data);
    const cards = data;
    const dropdown = document.getElementById('ddcard');
    const names = [];
    const ids = [];
    for(var i = 0; i < cards.length; i++){
        names[i] = cards[i].name;
        ids[i] = cards[i]._id
    }

    var x = 0;
    names.forEach(name =>{
        const option = document.createElement('option');
        option.textContent = name;
        option.value = ids[x];
        dropdown.appendChild(option);
        x++;
    })
    console.log(names);
    console.log(ids);
}

gotCards();
