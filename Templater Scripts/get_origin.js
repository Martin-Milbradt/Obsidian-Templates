function getOrigin(url) {
    const result = { Source: false, Author: false, Tags: [] };

    if (url.startsWith("https://slatestarcodex.com/")) {
        result.Source = "SSC";
        result.Author = "Scott Alexander";
        result.Tags.push("rationality");
    }
    else if (url.startsWith("https://www.astralcodexten.com/")) {
        result.Source = "ACX";
        result.Author = "Scott Alexander";
        result.Tags.push("rationality");
    }
    // TODO: Get Author from LW and EAF
    else if (url.startsWith("https://www.lesswrong.com/")) {
        result.Source = "LessWrong";
        result.Tags.push("rationality");
    }
    else if (url.startsWith("https://forum.effectivealtruism.org/posts/")) {
        result.Source = "EA Forum";
        result.Tags.push("ea");
    }

    return result;
}


module.exports = getOrigin;
