function createYamlArray(name, values, reference = false) {
    if (typeof values === "string") values = [values];
    if (!values || values.length == 0) return "";
    let yaml = `${name}:`;
    for (let v of values) {
        if (!v) continue;
        let elm = v;
        let delim = '"';
        if (elm.includes("'")) {
            elm = elm.replace(/"/g, '\\"');
        } else {
            delim = "'";
        }
        if (reference) elm = `[[${elm}]]`;
        yaml += `\n  - ${delim}${elm}${delim}`;
    }
    return yaml;
}

module.exports = createYamlArray;
