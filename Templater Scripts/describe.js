async function describe(tp, title, creator = null, year = null) {
    let request = `Write a neutral, concise and insightful description of "${title}"`;
    if (year) request += ` (${year})`;
    if (creator) request += ` by ${creator}`;
    const model = tp.user.utils.models("strong");
    const key = tp.user.secrets("OPENROUTER_API_KEY");

    const response = await tp.obsidian.request({
        url: "https://openrouter.ai/api/v1/chat/completions",
        method: "POST",
        headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: model,
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
            reasoning: {
                enabled: true,
            },
        }),
    });

    let data;
    if (typeof response === "string") {
        data = JSON.parse(response);
    } else if (response && typeof response.json === "function") {
        if (!response.ok) {
            const statusText = response.statusText || response.status || "Unknown error";
            throw new Error(`API error response: ${statusText}`);
        }
        data = await response.json();
    } else {
        data = response;
    }

    const description = data.choices[0].message.content;
    if (!description) {
        console.error("No description returned from API. Request:", request);
        throw new Error("No description returned from API. Request: " + request);
    }

    // Return the content from the choices
    return description;
}

module.exports = describe;
