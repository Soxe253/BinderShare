document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("addCard");
    
    form.addEventListener('submit', async (event) =>{
        event.preventDefault();
        
        const name = document.getElementById("name").value;
        const cardNumber = document.getElementById("cardNumber").value;
        const auto = document.getElementById("auto").checked;
        const variant = document.getElementById("variant").value;
        const owner = document.getElementById("owner").value;

        const data = {name, cardNumber, auto, variant, owner};
        console.log(owner);
        console.log(data);
        try{
            const response = await fetch('/addCard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const result = await response.json();
                alert('Card submitted successfully: ' + JSON.stringify(result));
                window.location.reload();
            } else {
                const errorText = await response.text();
                alert('Error submitting Card: ' + errorText);
            }

        } catch (err) {
            console.error('Error:', err);
            alert('Failed to submit Card.');

        }
    })
})