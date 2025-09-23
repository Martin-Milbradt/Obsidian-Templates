<%*
/* Requirements:

- User script sanitize_filename
- User script is_valid_url
*/

// Config options here
const scriptOptions = {
    folder: "/Media/Digital Games/",
}

let url_yaml = "";
let h1 = ""
let data;

let input = await tp.system.clipboard();
if (input == "Error_MobileUnsupportedTemplate") {
 input = ""
}

if (!tp.user.is_valid_url(input)) {
 input = await tp.system.prompt("Link / Title?");
}

if (tp.user.is_valid_url(input)) {
 const url = input.replace(/(https:\/\/store\.steampowered\.com\/app\/\d+\/).*/, '$1');
 data = await tp.user.get_metadata(url);
 url_yaml = `url:  ${url}`;
 input = data.title.replace(/ on Steam$/, "").replace(/^Save \d+% on/, "")
 if (!input) {
  input = await tp.system.prompt("Title?");
 }
 h1 = tp.user.create_h1(input, null, url)
} else {
 h1 = input
}

const filename = tp.user.sanitize_filename(input);
console.log(filename)
-%>
---
tags: backlog, game/pc
<% tp.user.create_yaml("creator", data?.Creator, true) %>
<% tp.user.create_yaml("published", data?.Published) %>
<% url_yaml %>
---
# <% h1 %>
<%* await tp.file.move(scriptOptions.folder + filename) %>