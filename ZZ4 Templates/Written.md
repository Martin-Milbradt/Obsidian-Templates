<%*
/* Requirements:

- User script is_valid_url
- User script get_origin
- User script create_h1
- User script get_metadata
- User script create_filename
- User script sanitize_link
- User script create_yaml_array
*/

// Config options here
const scriptOptions = {
 folder: "/Media/Written/",
}

let title = await tp.system.clipboard();
if (title == "Error_MobileUnsupportedTemplate") {
 title = ""
}

if (!tp.user.is_valid_url(title)) {
 title = await tp.system.prompt("Link / Title?");
}

let url_yaml = "";
let published = null;
let url = null;

let origin = tp.user.get_origin(title);

if (tp.user.is_valid_url(title)) {
 url = title;
 url_yaml = `url:  ${url}`;
 const data = await tp.user.get_metadata(title);
 if (tp.user.is_valid_url(data.title)) {
  title = await tp.system.prompt("Title?");
 } else {
  title = data.title;
  published = data.published;
 }
 if (data.creator && !origin.Creator) {
	origin.Creator = data.creator
 }
}

if (!origin.Source) {
 origin.Source = await tp.system.prompt("Source?");
 if (!origin.Creator) {
	 origin.Creator = await tp.system.prompt("Creator?");
	}
}

const source = origin.Source ? origin.Source : origin.Creator;

const h1 = tp.user.create_h1(title, source, url);
const filename = tp.user.create_filename(title, source);
await tp.file.move(scriptOptions.folder + filename)
-%>
---
<% tp.user.create_yaml_array("tags", ["written"].concat(origin.Tags)) %>
<% source ? tp.user.create_yaml_array("aliases", title) : "" %>
<% tp.user.create_yaml("creator", origin.Creator, true) %>
<% tp.user.create_yaml("published", published) %>
<% tp.user.create_yaml("source", origin.Source, true) %>
<% url_yaml %>
---
# <% h1 %>