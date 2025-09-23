function createFilename(title, source = "") {
    if (source) {
        source = source.split("|").pop();
        source = `${defaultSanitazions(source)} - `;
    } else {
        source = "";
    }
    title = title.replace(/[|<>]/g, "-");
    const sani = defaultSanitazions(title);
    return `${source}${sani}`;
}

function defaultSanitazions(text) {
    return text
        .replace(/:+ /, " - ")
        .replaceAll("? ", " - ")
        .replace(/[/\\:]/g, "-")
        .replace(/ ?& ?/g, " and ")
        .replace(/"([^"]+)"/g, "“$1”")
        .replace(/\[($1)\]/g, "($1)")
        .replace(/[?[\]#]/g, "")
        .replace(/[\s\x00-\x1F*]+/g, " ")
        .trim()
        .trimEnd(".");
}

module.exports = createFilename;
