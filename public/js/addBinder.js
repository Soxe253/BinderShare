document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("addBinder");
    
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = document.getElementById("bname").value;

        const data = { name };
        console.log(data);

        try {
            const response = await fetch('/addBinder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const result = await response.json();  // Get the JSON response
                alert('Binder created successfully');
                window.location.reload();  // Reload the page to reflect the new binder
            } else {
                const errorText = await response.text();
                alert('Error submitting Binder: ' + errorText);
            }

        } catch (err) {
            console.error('Error:', err);
            alert('Failed to submit Binder.');
        }
    });
});
