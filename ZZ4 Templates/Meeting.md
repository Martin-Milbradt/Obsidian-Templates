<%*
/* Requirements:

- User script createFilename
*/

// Config options here
const scriptOptions = {
    folder: "/Interpersonal/Meetings & Events/",
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
const filename = tp.user.createFilename(title, date);
-%>
---
date: <% date %>
host:
location:
participants:
---
# <% `[[${date}]] - ${title}` %>
<%* await tp.file.move(scriptOptions.folder + filename) %>
