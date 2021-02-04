import { VercelRequest, VercelResponse } from '@vercel/node'
import playwright from 'playwright-aws-lambda'
import marked from 'marked'

const defaultOptions = {
  width: 600,
  template: '<link rel="stylesheet" href="https://unpkg.com/github-markdown-css"><div class="markdown-body" style="padding: 2.5em">{{markdown}}</div>'
}

export default async (req: VercelRequest, res: VercelResponse): Promise<any> => {
  if (typeof req.body.markdown !== 'string' || req.body.markdown === '') {
    // return if without redirect url.
    return res.status(400).send({ message: 'Bad Request: missing required `markdown`.' })
  }
  const options = { ...defaultOptions, ...req.body }

  /* eslint-disable @typescript-eslint/strict-boolean-expressions */
  options.width = ~~options.width || defaultOptions.width
  options.template = options.template || defaultOptions.template
  /* eslint-enable @typescript-eslint/strict-boolean-expressions */

  const content = marked(options.markdown)

  const html = options.template.replace('{{markdown}}', content.trim())

  // capture screenshot by puppeteer
  const browser = await playwright.launchChromium()
  const page = await browser.newPage({ viewport: { width: options.width, height: 80 }, deviceScaleFactor: 2 })
  await page.setContent(html)
  const buffer = await page.screenshot({ fullPage: true })
  await browser.close()

  res.setHeader('content-type', 'image/png')
  res.send(buffer)
}
