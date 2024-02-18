<%*
/* Requirements:

- <https://github.com/danielo515/obsidian-modal-form>
- User script remove_filename_replacements
- User script sanitize_filename
- User script create_h1
*/
/* TODOs:
- add modal for owner
- clear file before inserting if it already exists
- insert title from clipboard
- Add year to title if note already exists
- Fields:
- Publisher
- Recommended players
*/

// Config options here
const scriptOptions = {
 folder: "/Media/Board Games/",
 defaultTitle: "Untitled"
}

// Set everything here that needs to be available in the template
let input = null; // The user input (Title, Year, Rating)
let game = null; // The result as a game (title, description, image, average, minPlayers, maxPlayers, year)
let sanitized_filename = null; // Sanitized filename (also used as note name);
let errorMsg = null; // Message in case of an error
let link = null;
const titleDefault = tp.file.title.startsWith(scriptOptions.defaultTitle) ? "" : tp.file.title;
let from_title = false;
const modalForm = app.plugins.plugins.modalforms.api;

async function getBoardGames(title) {
 // Save the board games here as a list
 const result = [];
 const exact_result = []
 const sanitized_title = tp.user.sanitize_filename(title);
 let search_string = title;
 if (from_title) {
  search_string = tp.user.remove_filename_replacements(title);
 }
 const url =
  "<https://boardgamegeek.com/xmlapi/search?search=>" +
  encodeURIComponent(search_string);
  
 console.log("Getting games from " + url);
 const xml = await tp.obsidian.request(url);
 const parser = new DOMParser();
 const xmlDoc = parser.parseFromString(xml, "application/xml");
 boardGameNodes = xmlDoc.getElementsByTagName("boardgame");
 if (boardGameNodes.length > 100) {
  throw new Error(`Found ${boardGameNodes.length} games for '${search_string}', be more specific.`);
 }
 for (let i = 0; i < boardGameNodes.length; i++) {
  console.log("Checking game " + (i + 1) +  " of " + boardGameNodes.length);
  const bggentry = {
   bggid: boardGameNodes[i].getAttribute("objectid"),
   title: boardGameNodes[i].getElementsByTagName["name"](0).textContent,
   year: boardGameNodes[i].getElementsByTagName["yearpublished"](0)?.textContent,
  }
  if (tp.user.sanitize_filename(bggentry.title) === sanitized_title) {
   exact_result.push(bggentry);
  } else {
   result.push(bggentry);
  }
 }
 if (exact_result.length > 0) {
  console.log(exact_result.length + " exact matches found: ");
  console.log(exact_result);
  return(exact_result);
 }
 console.log(result.length + " games found: ");
 console.log(result);
 return result;
}

async function selectBoardGame(inputData) {

 // If the title is used for the search, possible replacement symbols have to be removed later
 if (inputData.title === titleDefault) {
  from_title = true;
 }

 // Fetch list of board games
 // - BGG ID
 // - Title
 // - Year
 const boardGames = await getBoardGames(inputData.title);

 if (boardGames.length === 0) {
  throw new Error(`Found 0 games for '${inputData.title}'`);
 }

 // Create options list
 const options = []

 for (let i = 0; i < boardGames.length; i++) {
  console.log(boardGames[i]);
  let label = boardGames[i].title;
  if (boardGames[i].year) {
   label += " (" + boardGames[i].year + ")";
  }
  const option = {
   label: label,
   value: boardGames[i].bggid,
  };
  options.push(option);
 }

 // Sort by BGG ID (newest first)
 // Not working yet, see <https://github.com/danielo515/obsidian-modal-form/issues/61>
 options.sort((a, b) => (Number(a.value) < Number(b.value)) ? 1 : -1);
 console.log(options);

 if (options.length > 1) {
  const selectGameForm = {
   title: 'Select result',
   fields: [
    {
     name: 'bggGame',
     label: 'Game',
     description: 'The entry from BGG',
     input: {
      type: 'select',
      source: 'fixed',
      options,
     } ,
    },
   ],
  }
  // Show list to user to pick from
  selected_game = (await modalForm.openForm(selectGameForm)).data.bggGame;

  // Get details for the selected game
  console.log("Selected game id: " + selected_game);
 } else {
  selected_game = options[0].value
 }
 return await getBoardGameDetails(selected_game);;
}

async function getBoardGameDetails(bggid) {
 const parser = new DOMParser();
 const url = `https://boardgamegeek.com/xmlapi/boardgame/${bggid}?stats=1`;

 console.log("Getting game details from " + url);
 const xmlString = await tp.obsidian.request(url);
 const xmlDoc = parser.parseFromString(xmlString, "text/xml");
 const boardGame = xmlDoc.querySelector("boardgame");
 const title = xmlDoc.querySelector('name[primary="true"]')?.textContent || xmlDoc.querySelector('name')?.textContent || "Unknown Title";
 console.log(title)
 let descriptionNode = boardGame.querySelector("description")?.textContent || "";
 // Parse the HTML in this node to text (removes \br etc.)
 descriptionNode = descriptionNode.replace(/<br\/>/g, "\n");
 const description = parser.parseFromString(descriptionNode, "text/html")
  .documentElement.textContent;
 const image = boardGame.querySelector("image")?.textContent || "";
 const average =
  Number(boardGame.querySelector("average")?.textContent)?.toFixed(1) ||
  "";
 const minPlayers = boardGame.querySelector("minplayers")?.textContent || "";
 const maxPlayers = boardGame.querySelector("maxplayers")?.textContent || "";
 const year = boardGame.querySelector("yearpublished")?.textContent || "";

 return {
  bggid,
  title,
  description,
  image,
  average,
  minPlayers,
  maxPlayers,
  year,
 };
}

try {
 let selected_game = null;
 const clipboard = await tp.system.clipboard();
 if (clipboard != "Error_MobileUnsupportedTemplate") {
  const regex_id = /boardgamegeek\.com\/boardgame\/(\d+)/;
  selected_game = clipboard.match(regex_id)?.pop();
 }

 // This script needs <https://github.com/danielo515/obsidian-modal-form> to work! Form crated in visual editor and then copied from console.
 const inputForm = {
     "title": "Board Game",
     "name": "boardgame",
     "fields": [
         {
             "name": "title",
             "label": "Name?",
             "description": "",
             "input": {
                 "type": "text"
             }
         },
         {
             "name": "rating",
             "label": "Rating?",
             "description": "",
             "input": {
                 "type": "text"
             }
         },
     ]
 }

 if (selected_game) {
     game = await getBoardGameDetails(selected_game);
     input = await modalForm.openForm(inputForm, {
   values: {
    title: game.title
   }
  });
 } else {
  input = await modalForm.openForm(inputForm, {
   values: {
    title: titleDefault
   }
  });
  game = await selectBoardGame(input.data);
 }

 link = `https://boardgamegeek.com/boardgame/${game.bggid}`

    sanitized_filename = tp.user.sanitize_filename(game.title);
    console.log("Sanitized name: " + sanitized_filename);

    await tp.file.move(scriptOptions.folder + sanitized_filename);
} catch (error) {
    errorMsg = error;
    console.error(error);
}

-%>
<%* if (errorMsg !== null) {-%>
---

tags: ToDelete
---

<% errorMsg %>
<%* } else {-%>
---

tags: boardGame
bgg: <% game.average %>
minplayers: <% game.minPlayers %>
maxplayers: <% game.maxPlayers %>
owner:
rating: <% input.data.rating ?? "" %>
url: <% link %>
year: <% game.year %>
---

# <% tp.user.create_h1(game.title, null, link) %>

## Notes

## BGG Description

![Image from BGG](<% game.image %>)

<% game.description %>

<%* } -%>
