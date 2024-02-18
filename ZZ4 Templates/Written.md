<%*
/* Requirements:

- User script is_valid_url
- User script get_origin
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
let ref = title;
let published = null;

let origin = tp.user.get_origin(title);

if (tp.user.is_valid_url(title)) {
 const url = title;
 url_yaml = `url:  ${url}`;
 const data = await tp.user.get_metadata(title);
 if (tp.user.is_valid_url(data.Title)) {
  title = await tp.system.prompt("Title?");
 } else {
  title = data.Title;
  published = data.Published;
 }
 ref = `[${tp.user.sanitize_link(title)}](${url})`;
}

if (!origin.Source) {
 origin.Source = await tp.system.prompt("Source?");
 origin.Author = await tp.system.prompt("Author?");
}

const source = origin.Source ? origin.Source : origin.Author;

const h1 = `[[${source}]] - ${ref}`;
const filename = tp.user.create_filename(source, title);
await tp.file.move(scriptOptions.folder + filename)
-%>
---

<% tp.user.create_yaml_array("aliases", title) %>
<% tp.user.create_yaml_array("tags", ["written", origin.Tags]) %>
<% tp.user.create_yaml("creator", origin.Author, true) %>
<% tp.user.create_yaml("published", published) %>
finished: <% tp.date.now("YYYY-MM-DD") %>
<% tp.user.create_yaml("source", origin.Source, true) %>
<% url_yaml %>
---

# <% h1 %>
