function createH1(title, source = null, url = null) {
    let text = title
        .replaceAll("[", "(")
        .replaceAll("]", ")")
        .replaceAll("*", "")
        .replace(/[\s\x00-\x1F]+/g, " ")
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
