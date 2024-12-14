var fs = require("fs-extra");
var path = require("path");

var srcDir = path.join(__dirname, "../src");
var destDir = path.join(__dirname, "../build");

fs.copySync(srcDir, destDir, {
  filter: (src, dest) => {
    return path.extname(src) === ".js";
  },
});
