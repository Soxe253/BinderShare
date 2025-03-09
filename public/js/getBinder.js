async function getBinders(){//gets and puts all binders in a dropdown
    try{
        const response = await fetch('/binders');
        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error fetching binders: ', error);
    }
}

async function gotBinders(){
    const data = await getBinders();
    console.log(data);
    const binders = data;
    const dropdown = document.getElementById('dbinder');
    const names = [];
    const ids = [];
    for(var i = 0; i < binders.length; i++){
        names[i] = binders[i].name;
        ids[i] = binders[i]._id
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

gotBinders();
