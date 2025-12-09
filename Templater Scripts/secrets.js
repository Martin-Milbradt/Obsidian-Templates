function secrets(keyName) {
    const apiKeys = {
        OPENROUTER_API_KEY: "OPENROUTER_API_KEY",
        GOOGLE_API_KEY: "GOOGLE_API_KEY",
        BGG_BEARER: "BGG_BEARER",
        LW_USER_AGENT: "LW_USER_AGENT",
    };
    return apiKeys[keyName];
}

module.exports = secrets;
