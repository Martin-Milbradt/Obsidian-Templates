async function describe(title, creator = null, year = null) {
    let request = `Write a concise and insightful description of "${title}"`;
    if (year) request += ` (${year})`;
    if (creator) request += ` by ${creator}`;
    request += ".";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: "Bearer YOUR_TOKEN_HERE",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "anthropic/claude-opus-4.1",
            messages: [
                {
                    role: "system",
                    content:
                        "You write descriptions for books, movies, and other media. If there are multiple options for that title, make your best guess. Reply accordingly if you don't know the title at all. You should write a concise and insightful description of the media. Don't gush.",
                },
                {
                    role: "user",
                    content: request,
                },
            ],
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
    }

    // Parse the JSON response
    const data = await response.json();
    const description = data.choices[0].message.content;
    if (!description) {
        console.error("No description returned from API. Request:", request);
    }

    // Return the content from the choices
    return description;
}

module.exports = describe;
