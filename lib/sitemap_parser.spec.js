'use strict';

var mockery = require('mockery');
var fs = require('fs');
var request;
var async = require('async');
var parseXML = require('xml2js').parseString;
var sitemapParser;

describe('sitemap parser', function () {
    before(function () {
        mockery.enable({useCleanCache: true});
        mockery.registerAllowables(['request', './sitemap_parser']);

        initMockRequest();
        initMockRequestResp();

        sitemapParser = require('./sitemap_parser')(request, async, parseXML);
    });

    after(function () {
        mockery.disable();
        mockery.deregisterAll();
    });

    it('should parse simple sitemap', function (done) {
        var callback = function (err, sitemapUrlList) {
            expect(sitemapUrlList.length).to.be(2);
            expect(sitemapUrlList[0]).to.be('https://example.com/1');
            expect(sitemapUrlList[1]).to.be('https://example.com/2');
            done();
        };
        sitemapParser.parse('https://example.com/simple_sitemap_1.xml', callback);
    });

    it('should parse nested sitemap', function (done) {
        var callback = function (err, sitemapUrlList) {
            expect(sitemapUrlList.length).to.be(4);
            expect(sitemapUrlList[0]).to.be('https://example.com/1');
            expect(sitemapUrlList[1]).to.be('https://example.com/2');
            expect(sitemapUrlList[2]).to.be('https://example.com/3');
            expect(sitemapUrlList[3]).to.be('https://example.com/4');
            done();
        };
        sitemapParser.parse('https://example.com/index_sitemap.xml', callback);
    });

    function initMockRequest() {
        request = {get: sinon.stub()};
        /* jshint newcap:false */
        //request.returns(Q());
        mockery.registerMock('request', request);
    }

    function initMockRequestResp() {
        request.get.withArgs('https://example.com/simple_sitemap_1.xml').yields(null, buildResponse('resources/simple_sitemap_1.xml'));
        request.get.withArgs('https://example.com/index_sitemap.xml').yields(null, buildResponse('resources/index_sitemap.xml'));
        request.get.withArgs('https://example.com/simple_sitemap_2.xml').yields(null, buildResponse('resources/simple_sitemap_2.xml'));
    }

    function buildResponse(filename) {
        return {
            body: fs.readFileSync(filename).toString()
        };
    }
});