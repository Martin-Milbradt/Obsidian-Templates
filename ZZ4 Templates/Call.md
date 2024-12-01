<%*
/* Requirements:

- User script create_filename
*/

// Config options here
const scriptOptions = {
    folder: "/Interpersonal/Meetings & Events/Digital/",
}

const valid_date = /^\d{4}-\d\d-\d\d$/

let date = await tp.system.prompt("Date? Leave empty for today.")
let title = await tp.system.prompt("Title?")

if(!date) {
  date = tp.date.now("YYYY-MM-DD")
}

if (!isNaN(date)) {
 date = tp.date.now("YYYY-MM-DD", date*1)
}
if (!valid_date.test(date))
{
 throw new Error(`${date} is not a valid date.`);
}
const filename = tp.user.create_filename(title, date);
-%>
---
tags: digital, 1-1
date: <% date %>
with:
location: "[[digital]]"
---
# <% `[[${date}]] - ${title}` %>
<%* await tp.file.move(scriptOptions.folder + filename) %>
