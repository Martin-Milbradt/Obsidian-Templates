module.exports = (url) => {
    // console.log(/^(https?:\/*)(www\.)?\S+\.\S+$/.test(url));
    // console.log("|" + url + "|");
    return /^(https?:\/*)(www\.)?\S+\.\S+$/.test(url);
};
