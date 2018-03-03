/*!
 * bing-crawler
 * Copyright (c) 2018 Manuel Schächinger
 * MIT Lisenced
 */

'use strict';

const Crawler = require('./lib/Crawler'),
  ImageStore = require('./lib/ImageStore');

const crawler = new Crawler(),
  store = new ImageStore();

crawler.getImageUrl()
  .then(urlPath => {
    return store.createThumbFromUrl(urlPath)
  });


