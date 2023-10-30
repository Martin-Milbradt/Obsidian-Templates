<%*
/* Requirements:
	- User script is_valid_url
	- User script get_origin
	- User script get_title
	- User script sanitize_filename
*/

// Config options here
const scriptOptions = {
    folder: "/Media/Written/",
}

let title = await tp.system.clipboard();
if (!tp.user.is_valid_url(title)) {
	title = await tp.system.prompt("Link / Title?");
}

let url_yaml = "";
let ref = title;

let origin = tp.user.get_origin(title);

if (tp.user.is_valid_url(title)) {
	const url = title;
	url_yaml = `url:  ${url}`;
	title = await tp.user.get_title(title);
	title = title.split(/[|—]/)[0]
	ref = `[${title}](${url})`
}

if (!origin.Source) {
	origin.Source = await tp.system.prompt("Source?");
	origin.Author = await tp.system.prompt("Author?");
}

const source = origin.Source ? origin.Source : origin.Author;

const h1 = `[[${source}]] - ${ref}`;
const filename = tp.user.sanitize_filename(`${source} - ${title}`);
await tp.file.move(scriptOptions.folder + filename)
-%>
---
<% origin.Author ? `author: "[[${origin.Author}]]"` : "" %>
<% origin.Source ? `source: "[[${origin.Source}]]"` : "" %>
read: <% tp.date.now("YYYY-MM-DD") %>
tags:
  - written
<%* for (const tag of origin.Tags) {-%>
  - <% tag %>
<%* } -%>
<% url_yaml %>
---

# <% h1 %>
