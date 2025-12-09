function config(keyName) {
    const configs = {
        OPENROUTER_MODEL: "anthropic/claude-sonnet-4.5",
    };
    return configs[keyName];
}

module.exports = config;
