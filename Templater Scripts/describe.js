async function describe(title, creator = null, year = null, max_tokens = 500) {
    let request = `Write a concise and insightful description of "${title}"`;
    if (year) request += ` (${year})`;
    if (creator) request += ` by ${creator}`;
    request += ". Don't gush.";

    // make sure max tokens exist
    if (!max_tokens || max_tokens < 1) {
        console.warn(`max_tokens set to ${max_tokens}, resetting to default (500)`);
        max_tokens = 500;
    }

    // Construct the request payload
    const payload = {
        model: "o4-mini",
        max_completion_tokens: max_tokens, // check label on model change
        messages: [
            {
                role: "user",
                content: request,
            },
        ],
    };

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
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(`HTTP error: ${response.status}`);
    }

    // Parse the JSON response
    const data = await response.json();

    // Return the content from the choices
    return data.choices[0].message.content;
}

module.exports = describe;
