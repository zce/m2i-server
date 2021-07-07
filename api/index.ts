import { VercelRequest, VercelResponse } from '@vercel/node'
import chromium from 'chrome-aws-lambda'
import puppeteer from 'puppeteer-core'
import marked from 'marked'

interface Options {
  headless: boolean
  executablePath: string
  args: string[]
}

const defaultParams = {
  width: 600,
  height: 200,
  scale: 2,
  template: '<link rel="stylesheet" href="https://cdn.zce.me/markdown.css">{{markdown}}'
}

const chromiumPaths = {
  win32: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  linux: '/usr/bin/google-chrome'
}

// const chromiumPaths = {
//   win32: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
//   darwin: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
//   linux: '/usr/bin/microsoft-edge'
// }

const awsOptions = async (): Promise<Options> => ({
  headless: chromium.headless,
  executablePath: await chromium.executablePath,
  args: chromium.args
})

const localOptions = (): Options => ({
  headless: true,
  executablePath: chromiumPaths[process.platform as keyof typeof chromiumPaths],
  args: []
})

export default async (req: VercelRequest, res: VercelResponse): Promise<any> => {
  const { markdown } = req.body

  if (typeof markdown !== 'string' || markdown === '') {
    // return if without redirect url.
    return res.status(400).send({ message: 'Bad Request: missing required `markdown`.' })
  }

  /* eslint-disable @typescript-eslint/strict-boolean-expressions */
  const height = defaultParams.height
  const width = ~~req.body.width || defaultParams.width
  const deviceScaleFactor = ~~req.body.scale || defaultParams.scale
  const template = req.body.template || defaultParams.template
  /* eslint-enable @typescript-eslint/strict-boolean-expressions */

  const content = marked(markdown.replace(/^---$.*^---$\s*/ms, ''))
  const html = template.replace('{{markdown}}', content.trim())

  const options = process.env.AWS_REGION == null ? localOptions() : await awsOptions()
  const browser = await puppeteer.launch(options)
  const page = await browser.newPage()
  await page.setViewport({ width, height, deviceScaleFactor })
  await page.setContent(html)
  const buffer = await page.screenshot({ fullPage: true })
  await browser.close()

  res.setHeader('content-type', 'image/png')
  res.send(buffer)
}
