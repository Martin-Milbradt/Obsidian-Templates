async function safeRender(tp, renderFn) {
    try {
        const res = await renderFn(tp);
        return res.trim();
    } catch (error) {
        if (error.message === "User cancelled") {
            console.log("User cancelled the modal form.");
            return;
        }
        new Notice("Error in template, aborting: " + error.message, 5000);
        throw error;
    }
}

function models(type = "default") {
    const models = {
        strong: "google/gemini-3-pro-preview",
        default: "google/gemini-3-pro-preview",
    };
    return models[type];
}

module.exports = {
    safeRender,
    models,
};
