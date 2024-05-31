function getOrigin(url) {
    const result = { Source: false, Creator: false, Tags: [] };

    if (url.startsWith("https://slatestarcodex.com/")) {
        result.Source = "SSC";
        result.Creator = "Scott Alexander";
        result.Tags.push("rationality");
    } else if (url.startsWith("https://www.astralcodexten.com/")) {
        result.Source = "ACX";
        result.Creator = "Scott Alexander";
        result.Tags.push("rationality");
    }
    // get_metadata handles author
    else if (url.startsWith("https://www.lesswrong.com/")) {
        result.Source = "LessWrong";
        result.Tags.push("rationality");
    }
    // get_metadata handles author
    else if (url.startsWith("https://forum.effectivealtruism.org/posts/")) {
        result.Source = "EA Forum";
        result.Tags.push("ea");
    } else if (url.startsWith("https://thezvi.substack.com/p/")) {
        result.Source = "Don't Worry About the Vase";
        result.Creator = "Zvi Mowshowitz";
        result.Tags.push("rationality");
    } else if (url.startsWith("https://www.readthesequences.com/")) {
        result.Source = "The Sequences - Rationality From AI to Zombies|Sequences";
        result.Creator = "Eliezer Yudkowsky";
        result.Tags.push("rationality");
    } else if (url.startsWith("https://worksinprogress.co/")) {
        result.Source = "Works in Progress";
    } else if (url.startsWith("https://asteriskmag.com/")) {
        result.Source = "Asterisk";
    }

    return result;
}

module.exports = getOrigin;
