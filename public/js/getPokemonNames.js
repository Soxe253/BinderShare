let allCardNames = [];

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch('/card-names');
        allCardNames = await response.json();
    } catch (error) {
        console.error('Error fetching card names:', error);
    }
});

function showCardDropdown() {
    const input = document.getElementById("name");
    const dropdown = document.getElementById("cardDropdown");
    const filter = input.value.toLowerCase();

    dropdown.innerHTML = "";
    if (!filter) {
        dropdown.style.display = "none";
        return;
    }

    const filteredNames = allCardNames.filter(name => name.toLowerCase().includes(filter)).slice(0, 10);

    filteredNames.forEach(name => {
        const option = document.createElement("li");
        option.textContent = name;
        option.style.cursor = "pointer";
        option.onclick = () => {
            input.value = name;
            dropdown.style.display = "none";
        };
        dropdown.appendChild(option);
    });

    dropdown.style.display = filteredNames.length ? "block" : "none";
}
