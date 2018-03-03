/**
 * bing-crawler
 * Copyright (c) 2018 Manuel Schächinger
 * MIT Lisenced
 */

'use strict';

const fs = require('fs'),
  https = require('https'),
  path = require('path'),
  moment = require('moment'),
  thumb = require('node-thumbnail').thumb;

const { OPTIONS } = require('./constants');

class ImageStore {
  /**
   * Creates a new ImageStore instance to download and store images and thumbs.
   * 
   * @param {Object} [options] - The options passed to the https.get method.
   */
  constructor(options = {}) {
    /** @type {Object} */
    this._options = Object.assign(OPTIONS, options);
    /** @type {string} */
    this._downloadPath = path.resolve(__dirname, '../public/images');

    if (!fs.existsSync(this._downloadPath)) {
      // TODO: create recursive
      fs.mkdirSync(path.resolve(this._downloadPath, '../'));
      fs.mkdirSync(this._downloadPath);
    }
  }

  /**
   * Shortcut to download an image and create a thumbnail.
   * 
   * @param {string} urlPath - The path of the image that should be downloaded.
   * @param {string} thumbDir - The relative directory where the thumb should be stored.
   * @param {boolean} overwrite - Indicates whether existing files should be replaced by the generated content.
   * @param {Promise.<boolean>}
   */
  createThumbFromUrl(urlPath, thumbDir = './thumb', overwrite = true) {
    return this.downloadImage(urlPath, overwrite)
      .then(filePath => {
        return this.createThumb(filePath, thumbDir, overwrite);
      })
      .then(thumbPath => {
        return true;
      });
  }

  /**
   * Stores the image at the given path to the crawler download directory and
   * returns the path of the image file.
   * 
   * @param {string} urlPath - The path of the image without the domain.
   * @param {boolean} [overwrite] - Indicates whether an existing file
   *   should be removed if it is empty.
   * @returns {Promise.<string>}
   */
  downloadImage(urlPath, overwrite = true) {
    const options = Object.assign({}, this._options, { path: urlPath }),
      filePath = path.join(this._downloadPath, this._getImageName());

    return new Promise((resolve, reject) => {
      if (fs.existsSync(filePath)) {
        if (overwrite) {
          fs.unlinkSync(filePath);
        }
        else {
          resolve(filePath);
          return;
        }
      }

      const file = fs.createWriteStream(filePath);

      https.get(options, res => {
        res.pipe(file);

        res.on('end', () => {
          file.close();

          resolve(filePath);
        });
      }).on('error', reject);
    });
  }

  /**
   * Generates a thumbnail for the given image.
   * 
   * @param {string} filePath - The path of the image that should be thumbnailed.
   * @param {string} [thumbDir] - The directory the thumbs should be stored in
   *   relative to the filePath.
   * @param {boolean} [overwrite] - Indicates whether an existing file
   *   should be removed if it is empty.
   * @returns {Promise.<string>}
   */
  createThumb(filePath, thumbDir = './thumb', overwrite = true) {
    const parts = filePath.split(path.sep);
    parts.pop();
    const thumbPath = path.resolve(parts.join(path.sep), thumbDir);

    if (!fs.existsSync(thumbPath)) {
      // TODO: create recursive
      fs.mkdirSync(thumbPath);
    }

    return thumb({
      source: filePath,
      destination: thumbPath,
      suffix: '',
      overwrite: true,
      quiet: true,
      width: 200
    });
  }

  /**
   * Generates the file name of the image depending on the given date.
   * 
   * @private
   * @param {(Date|null)} [date] - The date that should be used to generate
   *   the file name or the current date if it was not given.
   * @param {string} [format] - The file format of the image.
   * @returns {string}
   */
  _getImageName(date = null, format = 'jpg') {
    return `${moment(date || new Date()).format('YYYY-MM-DD')}.${format}`;
  }
}

module.exports = ImageStore;
