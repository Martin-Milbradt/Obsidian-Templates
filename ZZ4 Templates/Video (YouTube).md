<%*
/* Requirements:

- User script create_filename
- User script create_h1
- User script create_yaml_array
- User script get_metadata
*/

// This template creates a new note from a YouTube URL. If there is a valid URL in the clipboard, it is used. Otherwise the user is asked for the URL to enter.

// Config options here
const scriptOptions = {
 folder: "/Media/Videos/",
}

const valid_youtube_url = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)\S+$/;
const disallowed = /[#<>"\?]/;

// Test URLs:
// url = "https://youtu.be/KB1vxqD0uPE"; // contains "|"
// url = "https://www.youtube.com/watch?v=F_8hbv3G1Q8"; // contains "?"

let url = "";
let clipboard = await tp.system.clipboard();
if (clipboard == "Error_MobileUnsupportedTemplate") {
 clipboard = ""
}
if (valid_youtube_url.test(clipboard)) {
 url = clipboard;
} else {
 url = await tp.system.prompt('Video Link?', '', true);
}

if (!valid_youtube_url.test(url)) {
 return "Couldn't parse given URL. Probably this is not a valid YouTube link: " + url;
}

const data = await tp.user.get_metadata(url);
console.log(data.title)
if (!data.success) {
	console.error(data.message)
	if (!data.title || !data.creator) {
		const modalForm = app.plugins.plugins.modalforms.api;
		values = {}
		if (data.title) {
			values.title = data.title
		}
		if (data.creator) {
			values.creator = data.creator
		}
		input = await modalForm.openForm("video", {values: values})
		data.title = input.data.title
		data.creator = input.data.creator
	}
}

filename = tp.user.create_filename(data.title, data.creator);
while (disallowed.test(filename)) {
 filename = (await tp.system.prompt('Enter new filename, it contains illegal characters. (#<>"?)', `${data.creator} - ${data.title}`, true)).trim();
}
filename = tp.user.create_filename(filename);

await tp.file.move(scriptOptions.folder + filename)
-%>
---

<% tp.user.create_yaml_array("aliases", data.title) %>
<% tp.user.create_yaml("creator", data.creator, true) %>
<% tp.user.create_yaml("published", data.published) %>
<% tp.user.create_yaml("length", data.length) %>
tags: YouTube
url: <% data.url %>
watched: <% tp.date.now("YYYY-MM-DD") %>
---

# <% tp.user.create_h1(data.title, data.creator, data.url) %>

![<% data.title %>](<% url %>)

## Notes
