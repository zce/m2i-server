import { VercelRequest, VercelResponse } from '@vercel/node'
import { launchChromium } from 'playwright-aws-lambda'
import marked from 'marked'

const defaultOptions = {
  width: 600,
  scale: 2,
  template: '<link rel="stylesheet" href="https://cdn.zce.me/markdown.css">{{markdown}}'
}

export default async (req: VercelRequest, res: VercelResponse): Promise<any> => {
  if (typeof req.body.markdown !== 'string' || req.body.markdown === '') {
    // return if without redirect url.
    return res.status(400).send({ message: 'Bad Request: missing required `markdown`.' })
  }

  const markdown = req.body.markdown
  const height = 80
  /* eslint-disable @typescript-eslint/strict-boolean-expressions */
  const width = ~~req.body.width || defaultOptions.width
  const deviceScaleFactor = ~~req.body.scale || defaultOptions.scale
  const template = req.body.template || defaultOptions.template
  /* eslint-enable @typescript-eslint/strict-boolean-expressions */

  const content = marked(markdown)

  const html = template.replace('{{markdown}}', content.trim())

  const browser = await launchChromium()
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor })
  await page.setContent(html)
  const buffer = await page.screenshot({ fullPage: true })
  await browser.close()

  res.setHeader('content-type', 'image/png')
  res.send(buffer)
}
