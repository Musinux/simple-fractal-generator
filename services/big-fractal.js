const Big = require('big.js')
/**
 *
 * Implementation with a BigNumber library, but not used in the project because it's too
 * slow (feel free to use it)
 */

class BigFractal {
  constructor () {
    this.roundingMode = 0
    this.threshold = new Big(2)
  }

  diverges (re2, im2) {
    return re2.add(im2).cmp(this.threshold) >= 0
  }

  suite (px, py, height, width, buf, bufp, limit) {
    const cRe = new Big((px - width / 2) / width * 4)
    const cIm = new Big((py - height / 2) / height * 4)
    let re = cRe // new Big(0)
    let im = cIm // new Big(0)
    let re2 = re.mul(re) // re²
    let im2 = im.mul(im) // im²
    let iter = limit

    while (iter && !this.diverges(re2, im2)) {
      // re = re² - im²
      // im = 2 * re * im
      im = re.mul(im).round(19, this.roundingMode)
      im = im.add(im).add(cIm)
      re = re2.sub(im2).add(cRe)
      // + c (re += c.re, im += c.im)
      re2 = re.mul(re).round(19, this.roundingMode)
      im2 = im.mul(im).round(19, this.roundingMode)
      iter--
    }

    buf[bufp++] = iter * limit
    buf[bufp++] = 0
    buf[bufp++] = 0
    buf[bufp++] = 255
  }
}

module.exports = BigFractal
