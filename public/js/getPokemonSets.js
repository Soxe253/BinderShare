let allSetNames = [];

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch('/set-names');
        allSetNames = await response.json();
    } catch (error) {
        console.error('Error fetching set names:', error);
    }
});

function showSetDropdown() {
    const input = document.getElementById("set");
    const dropdown = document.getElementById("setDropdown");
    const filter = input.value.toLowerCase();

    dropdown.innerHTML = "";
    if (!filter) {
        dropdown.style.display = "none";
        return;
    }

    const filteredNames = allSetNames.filter(name => name.toLowerCase().includes(filter)).slice(0, 10);

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
