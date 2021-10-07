const filterJs = (f, stat) => stat.isFile() && f !== "src/script.js";

module.exports = filterJs;
