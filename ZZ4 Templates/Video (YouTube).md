<%*
/* Requirements:

- User script create_filename
- User script create_h1
- User script create_yaml_array
*/

// This template creates a new note from a YouTube URL. If there is a valid URL in the clipboard, it is used. Otherwise the user is asked for the URL to enter.

// Config options here
const scriptOptions = {
 folder: "/Media/Videos/",
}

const valid_youtube_url = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)\S+$/;
const disallowed = /[#<>"\?]/;

// Test URLs:
// url = "<https://youtu.be/KB1vxqD0uPE>"; // contains "|"
// url = "<https://www.youtube.com/watch?v=F_8hbv3G1Q8>"; // contains "?"

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

let page = await tp.obsidian.request({url});
let p = new DOMParser();
let doc = p.parseFromString(page, "text/html");
let $ = s => doc.querySelector(s);

const v_channel = $("link[itemprop='name']").getAttribute("content");
const channel = v_channel.split[/ [—–-] /](0);
const v_title = $("meta[property='og:title']").content;
const v_upload_date = $("meta[itemprop='uploadDate']").content;
const v_linkurl = $("link[rel='shortLinkUrl']").href;
const v_duration = $("meta[itemprop='duration']").content.slice(2).replace(/M/, ":").replace(/S/, "").replace(/:(\d)$/, "\:0$1");
// let v_description = $("meta[itemprop='description']").content
filename = tp.user.create_filename(channel, v_title);
while (disallowed.test(filename)) {
 filename = (await tp.system.prompt('Enter new filename, it contains illegal characters. (#<>"?)', `${channel} - ${v_title}`, true)).trim();
}

await tp.file.move(scriptOptions.folder + filename)
-%>
---

<% tp.user.create_yaml_array("aliases", v_title) %>
<% tp.user.create_yaml("creator", channel, true) %>
date: <% v_upload_date %>
length: <% v_duration %>
tags: YouTube
url: <% v_linkurl %>
watched: <% tp.date.now("YYYY-MM-DD") %>
---

# <% tp.user.create_h1(v_title, channel, v_linkurl) %>

![<% v_title %>](<% url %>)

## Notes
