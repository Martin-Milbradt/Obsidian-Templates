<%*
/* Requirements:
	- https://github.com/danielo515/obsidian-modal-form
	- User script describe
	- User script sanitize_filename
	- User script create_yaml
*/

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
	]
};

const input = await app.plugins.plugins.modalforms.api.openForm(inputForm, {
		values: {
			generate: true
		}
	});
const creator = input.data.creator;
const year = input.data.year;
let title  = input.data.title;

let h1 = title;
let filename = title;
if (creator) {
	h1 = `[[${creator}]] - ${title}`;
	filename = `${creator} - ${title}`
}

await tp.file.rename(tp.user.sanitize_filename(filename));
-%>
---
<% tp.user.create_yaml("aliases", title) %>
<% tp.user.create_yaml("creator", creator, true) %>
<% year ? `year: ${year}` : "" %>
---

# <% h1 %>

<%* if(input.data.generate) { -%>
## Generated Description

<% await tp.user.describe(title, creator, year) %>

<%* } -%>