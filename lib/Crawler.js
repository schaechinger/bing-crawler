/**
 * bing-crawler
 * Copyright (c) 2018 Manuel Schächinger
 * MIT Lisenced
 */

'use strict';

const https = require('https'),
  path = require('path');

const { OPTIONS } = require('./constants');

const IMG_START = 'az/hprichbg';

class Crawler {
  /**
   * Creates a new crawler instance to fetch the url of today's image.
   * 
   * @constructor
   * @param {Object} [options] - Options are passed to the https.get method.
   */
  constructor(options = {}) {
    /** @type {Object} */
    this._options = Object.assign(OPTIONS, options);
  }

  /**
   * Retrieves the url of today's bing image.
   * 
   * @returns {Promise.<string>}
   */
  getImageUrl() {
    return this._loadPage()
      .then(html => {
        const start = html.indexOf(IMG_START);

        if (-1 !== start) {
          return `/${html.substring(start, html.indexOf('"', start))}`;
        }
        
        return null;
      });
  }

  /**
   * Returns the content of the page as defined in the constructor.
   * 
   * @private
   * @returns {Promise.<string>}
   */
  _loadPage() {
    return new Promise((resolve, reject) => {
      https.get(this._options, res => {
        let html = '';
        res.on('data', d => {
          html += d.toString();
        });

        res.on('end', () => {
          resolve(html);
        });
      }).on('error', reject);
    });
  }
}

module.exports = Crawler;
