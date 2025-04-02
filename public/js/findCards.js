document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");

    form.addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent default form submission

        const cardName = document.getElementById("name").value.trim();
        const cardNumber = document.getElementById("cardNumber").value.trim();

        if (!cardName) {
            alert("Please enter the card name");
            return;
        }

        try {
            
            let query = `q=name:"${encodeURIComponent(cardName)}"`;

            if (cardNumber) {
                query += ` number:"${encodeURIComponent(cardNumber)}"`;
            }

            const apiUrl = `https://api.pokemontcg.io/v2/cards?${query}`;

            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error("Failed to fetch Pokémon card data.");

            const data = await response.json();

            if (data.data.length === 0) {
                alert("No cards found with the given name and/or number.");
                return;
            }

            // Clear previous results
            const resultsContainer = document.getElementById("results");
            resultsContainer.innerHTML = "";

            // Display each matching card in a grid
            data.data.forEach(card => {
                const cardDiv = document.createElement("div");
                cardDiv.classList.add("card"); // Add grid styling class

                cardDiv.innerHTML = `
                    <img src="${card.images.small}" alt="${card.name}" data-id="${card.id}">
                    <p>${card.set.name}</p>
                `;

                // Attach click event to add card to collection
                cardDiv.querySelector("img").addEventListener("click", async function () {
                    const cardId = this.getAttribute("data-id");

                    try {
                        const response = await fetch("/add-to-collection", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ cardId })
                        });

                        const result = await response.json();

                        if (response.ok) {
                            alert("Card added successfully!");
                        } else {
                            alert(result.error || "Error adding card.");
                        }
                    } catch (error) {
                        console.error("Fetch error:", error);
                        alert("An error occurred while adding the card.");
                    }
                });

                resultsContainer.appendChild(cardDiv);
            });

        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while fetching the card data.");
        }
    });
});
