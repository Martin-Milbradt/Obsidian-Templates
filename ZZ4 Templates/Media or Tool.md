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

const input = await app.plugins.plugins.modalforms.api.openForm("media_or_tool", {
  values: {
   generate: false,
   media: true
  }
 });
 
let creator = input.data.creator;
let published = input.data.published;
let title  = input.data.title;
const url = input.data.link;
const year = input.data.year;

if (tp.user.is_valid_url(url)) {
  const data = await tp.user.get_metadata(url);
  if (data.title && !title) {
    title = data.title;
  }
  if (data.published && !published) {
    published = data.published;
  }
  if (data.creator && !creator) {
    creator = data.creator;
  }
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
<% tp.user.create_yaml("published", published) %>
<% tp.user.create_yaml("url", url) %>
---

# <% h1 %>

<%* if(input.data.generate) { -%>
## Generated Description

<% await tp.user.describe(title, creator, year) %>

<%* } -%>
