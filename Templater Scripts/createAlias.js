function createAlias(text) {
    return text.replaceAll("|", "-").trim();
}

module.exports = createAlias;
