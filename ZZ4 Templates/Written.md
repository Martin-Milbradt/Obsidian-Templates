---
note: Written
tags: []
created: 2025-10-31
---

# Written

Prerequisites:
- Templater (https://github.com/SilentVoid13/Templater)
- Modal Form (https://github.com/danielo515/obsidian-modal-form)

Description: This template creates a new note from a written work URL or title. If there is a valid URL in the clipboard, it is used. Otherwise the user is asked for the title or URL.

---

<%*
tR = "";
const output = await tp.user.utils.safeRender(tp, tp.user.written);
if (!output) return;
-%>
<% output %>
