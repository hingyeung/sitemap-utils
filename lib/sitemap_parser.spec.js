'use strict';

var mockery = require('mockery'),
    fs = require('fs'),
    Q = require('q');

var request, sitemapParser, ERROR = new Error();

describe('sitemap parser', function () {
    before(function () {
        mockery.enable({useCleanCache: true});
        mockery.registerAllowables(['async', 'xml2js', './sitemap_parser']);

        initMockRequest();
        initMockRequestResp();

        sitemapParser = require('./sitemap_parser');
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

    it('should call callback with err object', function() {
        var callback = function(err, data) {
            expect(err).to.equal(ERROR);
            done();
        };
        sitemapParser.parse('https://example.com/error', callback);
    });

    function initMockRequest() {
        request = sinon.stub();
        /* jshint newcap:false */
        request.returns(Q());
        mockery.registerMock('request-promise', request);
    }

    function initMockRequestResp() {
        mockRequestFor('https://example.com/simple_sitemap_1.xml', buildResponse('resources/simple_sitemap_1.xml'));
        mockRequestFor('https://example.com/index_sitemap.xml', buildResponse('resources/index_sitemap.xml'));
        mockRequestFor('https://example.com/simple_sitemap_2.xml', buildResponse('resources/simple_sitemap_2.xml'));
        mockErrorRequest('https://example.com/error', ERROR);
    }

    function mockErrorRequest(uri, error) {
        /* jshint newcap:false */
        mockRequestFor(uri, Q.fcall(function () {
            throw error;
        }));
    }

    function mockRequestFor(uri, response) {
        /* jshint newcap:false */
        request.withArgs(uri).returns(Q(response));
    }

    function buildResponse(filename) {
        return fs.readFileSync(filename).toString();
    }
});