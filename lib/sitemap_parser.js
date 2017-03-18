'use strict';

var request = require('request');
var async = require('async');
var parseXML = require('xml2js').parseString;

function SitemapGetter() {
    var q = async.queue(parseSitemap, 1);
    var sitemapUrlList = [];
    var completedCallback;

    function parse(sitemapUrl, callback) {
        sitemapUrlList = [];
        q.push(sitemapUrl);
        completedCallback = callback;
    }

    function parseSitemap(sitemapUrl, callback) {
        //console.log('Downloading sitemap:', sitemapUrl);
        request.get(sitemapUrl, function (err, resp) {
            var sitemapXmlStr = resp.body;

            parseXML(stripNewlineChar(sitemapXmlStr), function(err, sitemapObj) {
                if (isIndexSitemap(sitemapObj)) {
                    // extract nested sitemap urls
                    sitemapObj.sitemapindex.sitemap.forEach(function(item) {
                        q.push(item.loc[0].trim());
                    });
                } else {
                    var urlObj = sitemapObj.urlset.url;
                    urlObj.forEach(function(item) {
                        sitemapUrlList.push(item.loc[0].trim());
                    });
                }
                callback();
            });
        });
    }

    q.drain = function() {
        completedCallback(null, sitemapUrlList);
    };

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