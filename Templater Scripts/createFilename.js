function createFilename(title, source = "") {
    if (source) {
        source = source.split("|").pop();
        source = `${sanitize(source)} - `;
    } else {
        source = "";
    }
    title = sanitize(title);
    return `${source}${title}`;
}

function sanitize(text) {
    return text
        .replace(/:+ /, " - ")
        .replaceAll("? ", " - ")
        .replace(/[/\\:|<>]/g, "-")
        .replace(/ ?& ?/g, " and ")
        .replace(/"([^"]+)"/g, "“$1”")
        .replace(/\[($1)\]/g, "($1)")
        .replace(/[?[\]#]/g, "")
        .replace(/[\s\x00-\x1F*]+/g, " ")
        .trim()
        .trim(".");
}

module.exports = createFilename;
