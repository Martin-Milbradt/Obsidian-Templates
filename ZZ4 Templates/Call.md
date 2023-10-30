<%* 
// Config options here
const scriptOptions = {
    folder: "/Interpersonal/Meetings & Events/Digital/",
}

const prompt = await tp.system.prompt("Date? Leave empty for today.")
let title = await tp.system.prompt("Title?")
const date = !prompt | prompt == "" ? tp.date.now("YYYY-MM-DD") : prompt
-%>
---
tags: digital, 1-1
end: <% date %>
host: 
location: [[digital]]
start: <% date %>
---

# <% `[[${date}]] - ${title}` %>
<%* await tp.file.move(scriptOptions.folder + `${date} - ${tp.user.sanitize_filename(title)}`) %>