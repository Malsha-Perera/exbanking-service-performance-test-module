const reporter = require('k6-html-reporter');

const options = {
        jsonFile: "src/app/report/execution-results.json",
        output: "src/app/report",
    };

reporter.generateSummaryReport(options);