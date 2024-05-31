function sanitizeFilename(filename) {
    return filename
        .replace(/[|/\\]/g, "-")
        .replace(":", " -")
        .replace(/ & /g, " and ")
        .replace(/&/g, " and ")
        .replace(/"([^"]+)"/g, "“$1”")
        .replace(/\[($1)\]/g, "($1)")
        .replace("? ", " - ")
        .replace(/[?[\]]/g, "")
        .replace(/[\s\x00-\x1F*]+/g, " ") // warnings accepted here - I think sonarlint is mistaken
        .trim();
}

module.exports = sanitizeFilename;
