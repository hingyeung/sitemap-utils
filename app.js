'use strict';

var sitemapParser = require('./lib/sitemap_parser');

var argv = process.argv;
if (argv.length != 3) {
    console.log('Usgae: node', argv[1], '<url_to_sitemap>');
    return;
}

var url = argv[2];
sitemapParser.parse(url, function(err, data) {
    console.log(data);
    console.log(data.length);
});
