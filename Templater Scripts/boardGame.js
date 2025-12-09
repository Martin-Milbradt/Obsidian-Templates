// Config options here
const scriptOptions = {
    folder: "/Media/Board Games/",
    defaultTitle: "Untitled",
    token: null,
};

async function bggRequest(tp, url) {
    return await tp.obsidian.request({
        url: url,
        headers: { Authorization: `Bearer ${scriptOptions.token}` },
    });
}

function sortByYearPublished(arr) {
    return arr.sort((a, b) => {
        const yearA = Number(a.year) || 0;
        const yearB = Number(b.year) || 0;
        return yearB - yearA; // Descending: latest year first
    });
}

async function getBoardGames(tp, title) {
    // Save the board games here as a list
    const result = [];
    const exact_result = [];
    const sanitized_title = tp.user.createFilename(title);
    let search_string = title;

    const url = "https://boardgamegeek.com/xmlapi/search?search=" + encodeURIComponent(search_string);

    console.log("Getting games from " + url);
    const xml = await bggRequest(tp, url);
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "application/xml");
    boardGameNodes = xmlDoc.getElementsByTagName("boardgame");

    for (let i = 0; i < boardGameNodes.length; i++) {
        console.log("Checking game " + (i + 1) + " of " + boardGameNodes.length);
        const bggentry = {
            bggid: boardGameNodes[i].getAttribute("objectid"),
            title: boardGameNodes[i].getElementsByTagName("name")[0].textContent,
            year: boardGameNodes[i].getElementsByTagName("yearpublished")[0]?.textContent,
        };
        if (tp.user.createFilename(bggentry.title) === sanitized_title) {
            exact_result.push(bggentry);
        } else {
            result.push(bggentry);
        }
    }

    if (exact_result.length > 0) {
        console.log(exact_result.length + " exact matches found: ");
        console.log(exact_result);
        return exact_result;
    }
    console.log(result.length + " games found: ");
    console.log(result);
    return result;
}

async function selectBoardGame(tp, inputData) {
    // Fetch list of board games
    // - BGG ID
    // - Title
    // - Year
    const boardGames = await getBoardGames(tp, inputData.title);

    if (boardGames.length === 0) {
        throw new Error(`Found 0 games for '${inputData.title}'`);
    }

    // Create options list
    const options = [];
    sortByYearPublished(boardGames);
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

    console.log(options);

    const modalForm = app.plugins.plugins.modalforms.api;

    if (options.length > 1) {
        const selectGameForm = {
            title: "Select result",
            fields: [
                {
                    name: "bggGame",
                    label: "Game",
                    description: "The entry from BGG",
                    input: {
                        type: "select",
                        source: "fixed",
                        options,
                    },
                },
            ],
        };
        // Show list to user to pick from
        const selected_game = (await modalForm.openForm(selectGameForm)).data.bggGame;

        // Get details for the selected game
        console.log("Selected game id: " + selected_game);
        return await getBoardGameDetails(tp, selected_game);
    } else {
        return await getBoardGameDetails(tp, options[0].value);
    }
}

async function getBoardGameDetails(tp, bggid) {
    const parser = new DOMParser();
    const url = `https://boardgamegeek.com/xmlapi/boardgame/${bggid}?stats=1`;

    console.log("Getting game details from " + url);
    const xmlString = await bggRequest(tp, url);
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const boardGame = xmlDoc.querySelector("boardgame");
    const title =
        xmlDoc.querySelector('name[primary="true"]')?.textContent ||
        xmlDoc.querySelector("name")?.textContent ||
        "Unknown Title";
    let descriptionNode = boardGame.querySelector("description")?.textContent || "";
    // Parse the HTML in this node to text (removes \br etc.)
    descriptionNode = descriptionNode.replace(/<br\/>/g, "\n");
    const description = parser.parseFromString(descriptionNode, "text/html").documentElement.textContent;
    const image = boardGame.querySelector("image")?.textContent || "";
    const average = Number(boardGame.querySelector("average")?.textContent)?.toFixed(1) || "";
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

async function renderNote(tp) {
    if (!scriptOptions.token) {
        scriptOptions.token = tp.user.secrets("BGG_BEARER");
    }
    // Set everything here that needs to be available in the template
    let input = null; // The user input (Title, Year, Rating)
    let game = null; // The result as a game (title, description, image, average, minPlayers, maxPlayers, year)
    let sanitized_filename = null; // Sanitized filename (also used as note name);
    let link = null;
    let alias = null;
    const titleDefault = tp.file.title.startsWith(scriptOptions.defaultTitle) ? "" : tp.file.title;
    const modalForm = app.plugins.plugins.modalforms.api;

    let selected_game = null;
    const clipboard = await tp.system.clipboard();
    const regex_id = /boardgamegeek\.com\/boardgame\/(\d+)/;
    selected_game = clipboard.match(regex_id)?.pop();

    // This script needs <https://github.com/danielo515/obsidian-modal-form> to work! Form crated in visual editor and then copied from console.
    const inputForm = {
        title: "Board Game",
        name: "boardgame",
        fields: [
            {
                name: "title",
                label: "Name",
                description: "",
                input: {
                    type: "text",
                },
            },
            {
                name: "rating",
                label: "Rating",
                description: "",
                input: {
                    type: "text",
                },
            },
            {
                name: "coop",
                label: "Co-op?",
                description: "",
                input: {
                    type: "toggle",
                },
            },
        ],
    };

    if (selected_game) {
        game = await getBoardGameDetails(tp, selected_game);
        input = await modalForm.openForm(inputForm, {
            values: {
                title: game.title,
            },
        });
    } else {
        input = await modalForm.openForm(inputForm, {
            values: {
                title: titleDefault,
            },
        });
        game = await selectBoardGame(tp, input.data);
        if (game.title.toLowerCase() != input.data.title.toLowerCase()) {
            alias = input.data.title;
        }
    }

    link = `https://boardgamegeek.com/boardgame/${game.bggid}`;

    sanitized_filename = tp.user.createFilename(game.title);

    await tp.file.move(scriptOptions.folder + sanitized_filename);

    // Build the output content
    let output = "---\n";
    output += "tags:\n";
    output += "  - game/board";
    if (input.data.coop) {
        output += "\n  - game/co-op";
    }
    output += "\n";

    if (alias) {
        output += tp.user.createYamlArray("aliases", alias) + "\n";
    }

    output += `bgg: ${game.average}\n`;
    output += `minplayers: ${game.minPlayers}\n`;
    output += `maxplayers: ${game.maxPlayers}\n`;
    output += "owners:\n";
    output += `rating: ${input.data.rating ?? ""}\n`;
    output += `url: ${link}\n`;
    output += `year: ${game.year}\n`;
    output += "---\n";
    output += `# ${tp.user.createH1(game.title, null, link)}\n\n`;
    output += "## Notes\n\n";
    output += "## BGG Description\n\n";

    if (game.image) {
        output += `!${tp.user.createH1(game.title, null, game.image)}\n\n`;
    }

    output += game.description;

    return output;
}

module.exports = renderNote;
