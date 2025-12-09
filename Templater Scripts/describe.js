async function describe(tp, title, creator = null, year = null) {
    let query = `Write a neutral, concise and insightful description of "${title}"`;
    if (year) query += ` (${year})`;
    if (creator) query += ` by ${creator}`;
    const key = tp.user.secrets("OPENROUTER_API_KEY");
    let response = null;
    const request = {
        url: "https://openrouter.ai/api/v1/chat/completions",
        method: "POST",
        headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: tp.user.config("OPENROUTER_MODEL"),
            messages: [
                {
                    role: "system",
                    content:
                        "You write descriptions for books, movies, and other media. If there are multiple options for that title, make your best guess. Reply accordingly if you don't know the title at all. You should write a concise and insightful description of the media. Don't gush.",
                },
                {
                    role: "user",
                    content: query,
                },
            ],
            reasoning: {
                enabled: true,
            },
            stream: false,
        }),
    };
    try {
        response = await fetch(request.url, request);
        data = await response.json();
        // Parse the JSON response
        const description = data.choices[0].message.content;
        if (!description) {
            console.error("No description returned from API. Request:", request);
            throw new Error("No description returned from API. Request: " + request);
        }

        // Return the content from the choices
        return description;
    } catch (error) {
        console.error(request);
        if (response) {
            console.error(response);
        }
        throw error;
    }
}

module.exports = describe;
