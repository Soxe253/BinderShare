document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("deleteCard");

    form.addEventListener('submit', async (event) => {
        //event.preventDefault();

        const cardID = document.getElementById("ddcard").value;

        const data = {cardID};
        try{
            const response  = await fetch('/deleteCard', {
               method: 'DELETE',
               headers: {
                'Content-Type': 'application/json',
               },
               body: JSON.stringify(data),
            });
        } catch(e){
            console.error('Error:', e);
            console.log('failed');
        }
    });
});