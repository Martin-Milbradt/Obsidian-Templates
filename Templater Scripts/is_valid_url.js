module.exports = (url) => {
	return /^(https?:\/*)(www\.)?\S+\.\S+$/.test(url);
};
