function createYaml(name, values) {
    if(typeof values === 'string') values = [values];
    if (!values || values.length == 0) return "";
    let yaml = `${name}:`;
    for (const v of values) {
        yaml += `\n  - ${v}`;
    }
    return yaml;
}

module.exports = createYaml;
