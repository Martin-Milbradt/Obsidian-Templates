function createFilename(title, source = "") {
    if (source) {
        source = source.split("|").pop();
        source = `${defaultSanitazions(source)} - `;
    }
    title = title.replace("|", "-");
    return `${source}${defaultSanitazions(title)}`;
}

function defaultSanitazions(text) {
    return text
        .replace(/[/\\]/g, "-")
        .replace(/:+/, " -")
        .replace(/ & /g, " and ")
        .replace(/&/g, " and ")
        .replace(/"([^"]+)"/g, "“$1”")
        .replace(/\[($1)\]/g, "($1)")
        .replaceAll("? ", " - ")
        .replace(/[?[\]]/g, "")
        .replace(/[\s\x00-\x1F*]+/g, " ") // warnings accepted here - I think sonarlint is mistaken
        .trim()
        .trimEnd(".");
}

module.exports = createFilename;
