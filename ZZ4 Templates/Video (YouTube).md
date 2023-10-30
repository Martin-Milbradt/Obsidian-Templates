<%*
/* Requirements:
	- User script sanitize_filename
*/

// This template creates a new note from a YouTube URL. If there is a valid URL in the clipboard, it is used. Otherwise the user is asked for the URL to enter.

// Config options here
const scriptOptions = {
    folder: "/Media/Videos/",
}

const valid_youtube_url = /^(https?:\/*)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)\S+$/;
const disallowed = /[#<>"\?]/;

// Test URLs:
// url = "https://youtu.be/KB1vxqD0uPE"; // contains "|"
/ /url = "https://www.youtube.com/watch?v=F_8hbv3G1Q8"; // contains "?"

let url = "";
let clipboard = await tp.system.clipboard();
if (valid_youtube_url.test(clipboard)) {
    url = clipboard;
} else {
    url = await tp.system.prompt('Video Link?', '', true);
}

if (!valid_youtube_url.test(url)) {
    return "Couldn't parse given URL. Probably this is not a valid YouTube link:" + url;
}

let page = await tp.obsidian.request({url});
let p = new DOMParser();
let doc = p.parseFromString(page, "text/html");
let $ = s => doc.querySelector(s);

let v_channel = $("link[itemprop='name']").getAttribute("content");
let v_title = $("meta[property='og:title']").content;
let v_upload_date = $("meta[itemprop='uploadDate']").content;
let v_linkurl = $("link[rel='shortLinkUrl']").href;
let v_duration = $("meta[itemprop='duration']").content.slice(2).replace(/M/, ":").replace(/S/, "").replace(/:(\d)$/, "\:0$1");
let v_description = $("meta[itemprop='description']").content
let h1 = ("[[" + v_channel + "]] - [" + v_title + "](" + v_linkurl + ")");
filename = tp.user.sanitize_filename(v_channel + " - " + v_title);
while (disallowed.test(filename)) {
	filename = (await tp.system.prompt('Enter new filename, it contains illegal characters. (#<>"?)', `${v_channel} - ${v_title}`, true)).trim();
}

await tp.file.move(scriptOptions.folder + filename)
-%>
---
author: "[[<% v_channel %>]]"
date: <% v_upload_date %>
length: <% v_duration %>
title: <% v_title %>
url: <% v_linkurl %>
watched: <% tp.date.now("YYYY-MM-DD") %>
---
# <% h1 %>

![<% v_title %>](<% url %>)
<% v_description %>

## Notes
