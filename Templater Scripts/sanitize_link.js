function sanitizeLink(text) {
    return text
        .replaceAll("[","(")
        .replaceAll("]",")")
        .trim();
}

module.exports = sanitizeLink;
