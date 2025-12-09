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

module.exports = {
    safeRender,
};
