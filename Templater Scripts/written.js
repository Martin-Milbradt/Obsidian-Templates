const scriptOptions = {
    folder: "/Media/Written/",
};

async function renderNote(tp) {
    const clip = await tp.system.clipboard();
    let data = { title: "", url: "", tags: [] };

    if (tp.user.isValidUrl(clip)) {
        data = tp.user.getOrigin(clip);
        data.url = clip;
    } else {
        data.title = clip;
    }
    data.tags.push("written");

    let processed = false;
    if (data.url) {
        processed = data.url;
        await tp.user.getMetadata(tp, data);
    }

    const form = await app.plugins.plugins.modalforms.api.openForm("written_note", { values: data });

    data.url = form.data.url;
    data.title = form.data.title;
    data.source = form.data.source;
    data.creator = form.data.creator;
    data.recommender = form.data.recommender;
    data.tags = form.data.tags;

    if (!data.url && !data.title) {
        throw new Error("URL or title is required");
    }
    // If the URL has changed, fetch data and fill in the missing fields
    if (data.url != processed) {
        processed = data.url;
        origin = tp.user.getOrigin(data.url);
        if (!data.source) {
            data.source = origin.source;
        }
        if (!data.creator) {
            data.creator = origin.creator;
        }
        data.tags = Array.from(new Set(data.tags.concat(origin.tags))).sort();
        await tp.user.getMetadata(tp, data);
    }

    if (!data.title) {
        data.title = await tp.system.prompt("Couldn't find title, please enter manually.");
    }

    const source = data.source ? data.source : data.creator;

    const h1 = tp.user.createH1(data.title, source, data.url);
    const filename = tp.user.createFilename(data.title, source);
    await tp.file.move(scriptOptions.folder + filename);

    let output = "---\n";
    let yamlLines = [
        tp.user.createYamlArray("tags", data.tags),
        source ? tp.user.createYamlArray("aliases", data.title) : "",
        tp.user.createYaml("creator", data.creator, true),
        data.length ? tp.user.createYaml("length", `${data.length} words`) : "",
        tp.user.createYaml("published", data.published),
        tp.user.createYamlArray("recommenders", data.recommender, !tp.user.isValidUrl(data.recommender)),
        tp.user.createYaml("source", data.source, true),
        tp.user.createYaml("url", data.url),
    ].filter((line) => line && line.trim() !== "");
    output += yamlLines.join("\n") + "\n";
    output += "---\n";
    output += `# ${h1}\n`;

    return output.trim();
}

module.exports = renderNote;
