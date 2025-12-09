---
note: Board Game (new)
tags: []
created: 2025-10-22
---
# Board Game (new)

Prerequisites:
- Templater (https://github.com/SilentVoid13/Templater)
- Modal Form (https://github.com/danielo515/obsidian-modal-form)

Description: This template creates a new collection item "Board Game" note based on user input via a modal Form.
It searches BoardGameGeek, lets you select from results, and populates the note with BGG data.

---

<%*
tR = "";
const output = await tp.user.utils.safeRender(tp, tp.user.boardGame);
if (!output) return;
-%>
<% output %>
