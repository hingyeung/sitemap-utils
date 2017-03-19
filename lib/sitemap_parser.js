'use strict';

var request = require('request-promise'),
    async = require('async'),
    parseXML = require('xml2js').parseString;

function SitemapGetter() {
    var q = async.queue(parseSitemap, 1);
    var sitemapUrlList = [];
    var completedCallback;

    function parse(sitemapUrl, callback) {
        sitemapUrlList = [];
        q.push(sitemapUrl);
        completedCallback = callback;
    }

    function parseSitemap(sitemapUrl, qCallback) {
        request(sitemapUrl)
            .then(buildOnResponseReceivedCB(qCallback))
            .catch();
    }

    q.drain = function () {
        completedCallback(null, sitemapUrlList);
    };

    function buildOnResponseReceivedCB(callback) {
        return function (sitemapXmlStr) {
            parseXML(stripNewlineChar(sitemapXmlStr), buildSitemapXmlParserCallback(callback));
        };
    }

    function buildSitemapXmlParserCallback(callback) {
        return function extractUrlsFromSitemap(err, sitemapObj) {
            if (isIndexSitemap(sitemapObj)) {
                // extract nested sitemap urls
                sitemapObj.sitemapindex.sitemap.forEach(function (item) {
                    q.push(item.loc[0].trim());
                });
            } else {
                var urlObj = sitemapObj.urlset.url;
                urlObj.forEach(function (item) {
                    sitemapUrlList.push(item.loc[0].trim());
                });
            }
            console.log('done done done');
            callback();
        }
    }

    return {
        parse: parse
    };
}

function stripNewlineChar(str) {
    return str.replace(/\\n/g, '');
}

function isIndexSitemap(sitemapObj) {
    return sitemapObj.hasOwnProperty('sitemapindex');
}

module.exports = new SitemapGetter();