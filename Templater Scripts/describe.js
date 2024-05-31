async function describe(title, creator = null, year = null, max_tokens = 250) {
    let request = `Write a concise and insightful description of "${title}. Don't gush."`;
    if (year) request += ` (${year})`;
    if (creator) request += ` by ${creator}`;
    request += ".";

    // make sure max tokens exist
    if (!max_tokens || max_tokens < 1) {
        console.warn(`max_tokens set to ${max_tokens}, resetting to default (500)`);
        max_tokens = 250;
    }

    // Construct the request payload
    const payload = {
        model: "gpt-4o",
        max_tokens: max_tokens,
        messages: [
            {
                role: "user",
                content: request,
            },
        ],
    };

    try {
        // Perform the POST request to the GPT API endpoint
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer YOUR_TOKEN_HERE",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse the JSON response
        const data = await response.json();

        // Return the content from the choices
        return data.choices[0].message.content;
    } catch (error) {
        console.error("Error posting to GPT API:", error);
        throw error;
    }
}

module.exports = describe;
