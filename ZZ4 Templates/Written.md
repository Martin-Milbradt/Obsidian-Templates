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

let clip = await tp.system.clipboard()
let data = {}

if (clip === "Error_MobileUnsupportedTemplate") {
  clip = "";
}

if (tp.user.is_valid_url(clip)) {
  data = tp.user.get_origin(clip);
  data.url = clip
} else {
  data.title = clip
}

// Open the form
const form = await app.plugins.plugins.modalforms.api.openForm("written_note", { values: data });

// Update data with form values
// `data` also might contain tags which would be overwritten by just setting = here.
data.url = form.data.url
data.title = form.data.title
data.source = form.data.source
data.creator = form.data.creator
data.recommender = form.data.recommender

if (!data.url && !data.title) {
  throw new Error("URL or title is required");
}

if (data.url) {
  const metadata = await tp.user.get_metadata(data.url);
  if(!data.title) {
    data.title = metadata.title;
  }
  data.published = metadata.published;
  if (!data.creator) {
    data.creator = metadata.creator;
  }
}

if (!data.title) {
  data.title = await tp.system.prompt("Couldn't find title, please enter manually.");
}

const source = data.source ? data.source : data.creator;
const h1 = tp.user.create_h1(data.title, data.source, data.url);
const filename = tp.user.create_filename(data.title, data.source);
await tp.file.move(scriptOptions.folder + filename)
-%>
---
<% tp.user.create_yaml_array("tags", ["written"].concat(data.tags)) %>
<% source ? tp.user.create_yaml_array("aliases", data.title) : "" %>
<% tp.user.create_yaml("creator", data.creator, true) %>
<% tp.user.create_yaml("published", data.published) %>
<% tp.user.create_yaml_array("recommenders", data.recommender, !tp.user.is_valid_url(data.recommender)) %>
<% tp.user.create_yaml("source", data.source, true) %>
<% tp.user.create_yaml("url", data.url) %>
---

# <% h1 %>