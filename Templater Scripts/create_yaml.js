function createYaml(name, value, reference = false) {
    if (!value) return "";
    value = value
        .replace(/"/g, '\\"');
    if (reference) value = `[[${value}]]`;
    return `${name}: "${value}"`;
}

module.exports = createYaml;
