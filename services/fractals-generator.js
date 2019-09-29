const { createCanvas } = require('canvas')
/**
 * Calculation of a subset of a Mandelbrot set follows these steps
 *  * each point of an image is calculated with the following suite (given c the coord):
 *    * z0 = 0
 *    * z_n+1 = z_n² + c
 *  * The color of the point is determined by the speed of divergence of the suite for c, or if the suite converges
 *  * we know that the suite diverges if sqrt(im² + re²) > 4
 *  * Because the process of diverging can take a lot of iterations, we determine a limit of iterations after which
 *     we estimate that the suite diverges (probabilistically)
 *
 *  * We then have to calculate, for each divergence speed, which color will be attributed
 *
 */
/**
 * @param {Number} p
 * @param {Number} q
 * @param {Number} t
 * @return {Number}
 */
function hue2rgb (p, q, t) {
  if (t < 0) t += 1
  if (t > 1) t -= 1
  if (t < 0.16) return p + (q - p) * 6.0 * t
  if (t < 0.5) return q
  if (t < 0.66) return p + (q - p) * (0.66 - t) * 6.0
  return p
}

/**
 * @param {Number} speed
 * @param {Number} max_iterations
 */
function speedToColor (speed, maxIterations) {
  // b = log(1) - log(max)
  // max = b * log(x)
  const max = maxIterations * 0.4
  const n = speed / max
  const saturation = 1
  const light = 0.6

  const q = light + saturation + light * saturation
  const p = 2.0 * light - q
  // var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  // var p = 2 * l - q;
  return [
    hue2rgb(p, q, n + 0.33) * 255.0,
    hue2rgb(p, q, n) * 255.0,
    hue2rgb(p, q, n - 0.33) * 255.0,
    255
  ]
}

class SimpleFractal {
  constructor (limit) {
    this.colors = []

    for (let i = 0; i <= limit; i++) {
      this.colors.push(speedToColor(i, limit))
    }
  }

  coordToComplex (x, y, r) {
    return {
      re: ((x / r.width) * (r.right - r.left)) + r.left,
      im: ((y / r.height) * (r.bottom - r.top)) + r.top
    }
  }

  suite (px, py, r, limit) {
    const c = this.coordToComplex(px, py, r)
    let re = 0 // c.re
    let im = 0 // c.im
    let re2 = re * re // re²
    let im2 = im * im // im²
    let iter = 0

    while (iter < limit && re2 + im2 < 2) {
      im = re * im * 2 + c.im
      re = re2 - im2 + c.re
      re2 = re * re
      im2 = im * im
      iter++
    }

    return this.colors[iter]
  }
}

async function timeout (ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 * Calculate a fractal image and return the image in a base64-encoded image
 * @param {{'re': Number, 'im': Number}} leftTop
 * @param {{'re': Number, 'im': Number}} bottomRight
 * @param {Number} width
 * @param {Number} height
 * @param {Number} [limit=20] threshold of calculation
 * @returns {String}
 */
async function createFractal (r, limit = 20) {
  const canvas = createCanvas(r.width, r.height)
  const ctx = canvas.getContext('2d')

  const img = ctx.getImageData(0, 0, r.width, r.height)
  const buf = img.data
  let bufp = 0
  const f = new SimpleFractal(limit)

  for (let j = 0; j < r.height; j++) {
    for (let i = 0; i < r.width; i++) {
      const color = f.suite(i, j, r, limit)

      for (let i = 0; i < color.length; i++) {
        buf[bufp++] = color[i]
      }
    }
  }
  ctx.putImageData(img, 0, 0)

  return canvas.toDataURL()
}

module.exports = createFractal
