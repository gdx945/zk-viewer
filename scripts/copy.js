#!/usr/bin/env node

var fs = require("fs-extra");
var dir = "./app/public";
var dist_dir = "./dist";

fs.removeSync(dir);
console.log("clean dist dir success");

fs.copy(dist_dir, dir, function(error) {
	if (error) {
		return console.error(error);
	}
	// fs.removeSync(dist_dir);
	console.log("copy css to dist success");
});
