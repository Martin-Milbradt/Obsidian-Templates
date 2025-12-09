<%*
/* Requirements:

- User script createFilename
- User script isValidUrl
*/

// Config options here
const scriptOptions = {
    folder: "/Media/Digital Games/",
}

let url_yaml = "";
let h1 = ""
let data;

let input = await tp.system.clipboard();

if (!tp.user.isValidUrl(input)) {
 input = await tp.system.prompt("Link / Title?");
}

if (tp.user.isValidUrl(input)) {
 const url = input.replace(/(https:\/\/store\.steampowered\.com\/app\/\d+\/).*/, '$1');
 data = { url: url };
 await tp.user.getMetadata(tp, data);
 url_yaml = `url:  ${url}`;
 input = data.title.replace(/ on Steam$/, "").replace(/^Save \d+% on/, "")
 if (!input) {
  input = await tp.system.prompt("Title?");
 }
 h1 = tp.user.createH1(input, null, url)
} else {
 h1 = input
}

const filename = tp.user.createFilename(input);
-%>
---
tags:
  - backlog
  - game/pc
<% tp.user.createYaml("creator", data?.Creator, true) %>
<% tp.user.createYaml("published", data?.Published) %>
<% url_yaml %>
---
# <% h1 %>
<%* await tp.file.move(scriptOptions.folder + filename) %>
