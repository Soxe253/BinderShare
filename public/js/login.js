document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("login");

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        const data = {username, password};
        console.log(data);
        console.log('User: ' + JSON.stringify(data.username) + JSON.stringify(data.password));
        try{
            const response  = await fetch('/login', {
               method: 'POST',
               headers: {
                'Content-Type': 'application/json',
               },
               body: JSON.stringify(data),
            });

            if(response.ok) {
                const result = await response.json();
                console.log('username and password accepted'  + JSON.stringify(result));
                window.location.href = '/home';
            } else {
                const errorT = await response.text();
                console.log('error in username or password');
            }
        } catch(e){
            console.error('Error:', e);
            console.log('failed');
        }
    });
});