<%*
/* Requirements:

- https://github.com/danielo515/obsidian-modal-form
- User script describe
- User script sanitize_filename
- User script create_filename
- User script create_yaml
- User script create_h1
- User script create_yaml_array
*/

const scriptOptions = {
 toolFolder: "/Websites, Tools & Products/",
}

const inputForm = {
 "title": "Create Note",
 "name": "note",
 "fields": [
  {
   "name": "title",
   "label": "Title",
   "description": "",
   "input": {
    "type": "text"
   }
  },
  {
   "name": "creator",
   "label": "Creator",
   "description": "",
   "input": {
    "type": "text"
   },
  },
  {
   "name": "link",
   "label": "Link",
   "description": "",
   "input": {
    "type": "text"
   }
  },
  {
   "name": "year",
   "label": "Year",
   "description": "",
   "input": {
    "type": "number"
   }
  },
  {
	"name": "generate",
	"label": "Generate description",
	"description": "",
	"input": {
		"type": "toggle"
	}
  },
  {
	"name": "media",
	"label": "Tool-Media",
	"description": "",
	"input": {
		"type": "toggle"
	}
  },
 ]
};

const input = await app.plugins.plugins.modalforms.api.openForm(inputForm, {
  values: {
   generate: false,
   media: true
  }
 });
 
let creator = input.data.creator;
let year = input.data.year;
let title  = input.data.title;
const url = input.data.link;

if (url) {
  const data = await tp.user.get_metadata(url);
  creator = creator ?? data.Creator
  year = year ?? data.Published
  title = (title ?? data.Title) ?? url
}

const filename = tp.user.create_filename(title, creator);

h1 = tp.user.create_h1(title, creator, url)

await tp.file.rename(filename);
if (!input.data.media) {
  await tp.file.move(scriptOptions.toolFolder + filename)
}
-%>
---
<% creator ? tp.user.create_yaml_array("aliases", title) : "" %>
<% tp.user.create_yaml("creator", creator, true) %>
<% input.data.media ? tp.user.create_yaml_array("tags", ["backlog"]) : "" %>
<% year ? `year: ${year}` : "" %>
tags:
<% tp.user.create_yaml("url", url) %>
---

# <% h1 %>

<%* if(input.data.generate) { -%>
## Generated Description

<% await tp.user.describe(title, creator, year) %>

<%* } -%>
