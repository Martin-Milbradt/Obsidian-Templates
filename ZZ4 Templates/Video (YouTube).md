---
note: Video (YouTube)
tags: []
created: 2025-10-31
---

# Video (YouTube)

Prerequisites:
- Templater (https://github.com/SilentVoid13/Templater)
- Modal Form (https://github.com/danielo515/obsidian-modal-form)

Description: This template creates a new note from a YouTube URL. If there is a valid URL in the clipboard, it is used. Otherwise the user is asked for the URL to enter.

---

<%*
tR = "";
const output = await tp.user.utils.safeRender(tp, tp.user.videoYoutube);
if (!output) return;
-%>
<% output %>
