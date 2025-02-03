document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('username');
        const passwrod = document.getElementById('password');

        const data = {username, password};

        try{
            const response  = await fetch('/login', {
                
            })
        }
    })
})