document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("deleteBinder");

    form.addEventListener('submit', async (event) => {
        //event.preventDefault();

        const binderID = document.getElementById("dbinder").value;

        const data = {binderID};
        try{
            const response  = await fetch('/deleteBinder', {
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