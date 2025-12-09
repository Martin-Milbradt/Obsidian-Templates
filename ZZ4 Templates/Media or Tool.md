<%*
/* Requirements:

- https://github.com/danielo515/obsidian-modal-form
- User script describe
- User script createFilename
- User script create_yaml
- User script create_h1
- User script createYamlArray
*/

const scriptOptions = {
 toolFolder: "/Websites, Tools & Products/",
}

const clip = await tp.system.clipboard()

let url = "";
let title = "";

if (tp.user.isValidUrl(clip)) {
  url = clip;
} else {
  title = clip
}

const input = await app.plugins.plugins.modalforms.api.openForm("media_or_tool", {
  values: {
   link: url,
   title: title,
   generate: false,
   media: true
  }
 });

let creator = input.data.creator;
let published = input.data.published;
title  = input.data.title;
url = input.data.link;
const year = input.data.year;

if (tp.user.isValidUrl(url)) {
  const data = { url: url };
  await tp.user.getMetadata(tp, data);
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

const filename = tp.user.createFilename(title, creator);

h1 = tp.user.createH1(title, creator, url)

await tp.file.rename(filename);
if (!input.data.media) {
  await tp.file.move(scriptOptions.toolFolder + filename)
}
let description = null
if (input.data.generate) {
  description = await tp.user.describe(tp, title, creator, year)
}
-%>
---
<% creator ? tp.user.createYamlArray("aliases", title) : "" %>
<% tp.user.createYaml("creator", creator, true) %>
<% input.data.backlog ? tp.user.createYamlArray("tags", ["backlog"]) : "" %>
<% tp.user.createYaml("published", published) %>
<% tp.user.createYaml("url", url) %>
---

# <% h1 %>
<%* if(description) { -%>

## Generated Description

<% description %>
<%* } -%>
