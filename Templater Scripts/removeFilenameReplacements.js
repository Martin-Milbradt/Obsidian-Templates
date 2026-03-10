function removeReplacements(filename) {
    return filename
        .replace(/-| and /g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

module.exports = removeReplacements;
