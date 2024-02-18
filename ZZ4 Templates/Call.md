<%*
/* Requirements:

- User script create_filename
*/

// Config options here
const scriptOptions = {
    folder: "/Interpersonal/Meetings & Events/Digital/",
}

const prompt = await tp.system.prompt("Date? Leave empty for today.")
let title = await tp.system.prompt("Title?")
const date = !prompt | prompt == "" ? tp.date.now("YYYY-MM-DD") : prompt
const filename = tp.user.create_filename(date, title);
-%>
---

tags: digital, 1-1
end: <% date %>
with:
location: "[[digital]]"
start: <% date %>
---

# <% `[[${date}]] - ${title}` %>

<%* await tp.file.move(scriptOptions.folder + filename) %>
