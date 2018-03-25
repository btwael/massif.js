var Massifjs = {
    SNAPSHOT_FEATURES: ["time", "mem_heap_B", "mem_heap_extra_B", "mem_stacks_B"/*, "heap_tree"*/],
    MASSIFJS_PARSING_REGEX: null,
    getRegex: function() {
        if(this.MASSIFJS_PARSING_REGEX === null) {
            var n = "\\n",
                integer = "([0-9]+)",
                delimiter = "#-{11}" + n;
            var x = "";
            x += delimiter;
            x += "snapshot=" + integer + n;
            x += delimiter;
            this.SNAPSHOT_FEATURES.forEach(function(feature) {
                x += feature + "=" + integer + n;
            });
            this.MASSIFJS_PARSING_REGEX = new RegExp(x, "g");
        }
        return this.MASSIFJS_PARSING_REGEX;
    },
    parse: function(source) {
        var object = {};
        // extracts used cmd and time unit
        object.cmd = (/cmd: ([^\n]+)/g).exec(source)[1];
        object.time_unit = (/time_unit: ([^\n]+)/g).exec(source)[1]; // we only support i
        // extracts snapshots
        object.snapshots = [];
        var snapshotMatch;
        while((snapshotMatch = this.getRegex().exec(source)) != null) {
            var snapshot = {};
            snapshot["snapshot"] = parseInt(snapshotMatch[1]);
            this.SNAPSHOT_FEATURES.forEach(function(feature, i) {
                snapshot[feature] = snapshotMatch[i + 1];
            });
            object.snapshots.push(snapshot);
        }
        return object;
    }
};

module.exports = Massifjs;

fs = require("fs");
console.log(Massifjs.parse(fs.readFileSync("/Users/btwael/btwael/btwael/SuperString/cmake-build-debug/test/massif.out.2953", "utf8")));
