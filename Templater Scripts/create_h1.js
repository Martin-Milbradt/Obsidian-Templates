function createH1(title, source = null, url = null) {
    text = title
        .replaceAll("[","(")
        .replaceAll("]",")")
        .trim();
    if (url) {
        text = `[${text}](${url})`;
    }
    if (source) {
        text = `[[${source}]] - ${text}`;
    }
    return text;
}

module.exports = createH1;
