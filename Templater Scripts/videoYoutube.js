const scriptOptions = {
    folder: "/Media/Videos/",
};

const valid_youtube_url = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)\S+$/;
const disallowed = /[#<>"\?]/;

async function renderNote(tp) {
    let url = "";
    const clipboard = await tp.system.clipboard();

    if (valid_youtube_url.test(clipboard)) {
        url = clipboard;
    } else {
        url = await tp.system.prompt("Video Link?", "", true);
    }

    if (!valid_youtube_url.test(url)) {
        throw new Error(`Couldn't parse given URL. Probably this is not a valid YouTube link: ${url}`);
    }

    const data = { url: url };
    await tp.user.getMetadata(tp, data);

    if (!data.success) {
        if (!data.title || !data.creator) {
            const modalForm = app.plugins.plugins.modalforms.api;
            let values = {};
            if (data.title) {
                values.title = data.title;
            }
            if (data.creator) {
                values.creator = data.creator;
            }
            const input = await modalForm.openForm("video", { values: values });
            data.title = input.data.title;
            data.creator = input.data.creator;
        }
    }

    let filename = tp.user.createFilename(data.title, data.creator);
    while (disallowed.test(filename)) {
        filename = (
            await tp.system.prompt(
                'Enter new filename, it contains illegal characters. (#<>"?)',
                `${data.creator} - ${data.title}`,
                true
            )
        ).trim();
    }
    alias = tp.user.createAlias(data.title);
    filename = tp.user.createFilename(filename);

    await tp.file.move(scriptOptions.folder + filename);

    let output = "---\n";
    let yamlLines = [
        tp.user.createYamlArray("aliases", alias),
        tp.user.createYaml("creator", data.creator, true),
        tp.user.createYaml("published", data.published),
        tp.user.createYaml("length", data.length),
        "tags: YouTube",
        `url: ${data.url}`,
        `finished: ${tp.date.now("YYYY-MM-DD")}`,
    ].filter((line) => line && line.trim() !== "");
    output += yamlLines.join("\n") + "\n";
    output += "---\n";
    output += `# ${tp.user.createH1(data.title, data.creator, data.url)}\n\n`;
    output += `!${tp.user.createH1(data.title, null, data.url)}\n\n`;
    output += "## Notes\n\n";

    return output.trim();
}

module.exports = renderNote;
