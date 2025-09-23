function createYaml(name, values, reference = false) {
    if (typeof values === "string") values = [values];
    if (!values || values.length == 0) return "";
    let yaml = `${name}:`;
    for (let v of values) {
        if (!v) continue;
        let elm = v.replace(/"/g, '\\"');
        if (reference) elm = `[[${elm}]]`;
        yaml += `\n  - "${elm}"`;
    }
    return yaml;
}

module.exports = createYaml;
