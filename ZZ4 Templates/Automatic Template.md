<%*
/* Requirements:
	- Requirements from called templates
*/

// Config options here
const scriptOptions = {
    folder: "/ZZ4 Templates/",
}

const valid_youtube_url = /^(https?:\/*)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)\S+$/;
const valid_bgg_url = /^(https?:\/*)?(www\.)?boardgamegeek\.com\/boardgame\/(\d+)\S*$/;
let clipboard = await tp.system.clipboard();

// Test URLs:
// clipboard = "https://youtu.be/KB1vxqD0uPE";
// clipboard = "https://slatestarcodex.com/2014/01/12/a-response-to-apophemi-on-triggers/"
// clipboard = "https://boardgamegeek.com/boardgame/235902/natives"

let template;
if (valid_youtube_url.test(clipboard)) {
    template = tp.file.find_tfile(scriptOptions.folder + "Video (YouTube)")
} else if (valid_bgg_url.test(clipboard)) {
	template = tp.file.find_tfile(scriptOptions.folder + "Board Game")
} else {
	template = tp.file.find_tfile(scriptOptions.folder + "Written");
}
await tp.file.create_new(template, "Untitled", true);
-%>