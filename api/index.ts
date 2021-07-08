import fs from 'fs/promises'
import path from 'path'
import marked from 'marked'
import puppeteer from 'puppeteer-core'
import chromium from 'chrome-aws-lambda'
import { VercelRequest, VercelResponse } from '@vercel/node'

interface Options {
  headless: boolean
  executablePath: string
  args?: string[]
}

const defaultParams = {
  width: 600,
  height: 200,
  scale: 2,
  template: '<link rel="stylesheet" href="https://cdn.zce.me/markdown.css">{{markdown}}'
}

/**
 * Checks whether something exists on given path.
 * @param input input path
 */
export const exists = async (input: string): Promise<boolean> => {
  try {
    const stat = await fs.stat(input)
    return stat.isFile()
  } catch (err) {
    /* istanbul ignore if */
    if (err.code !== 'ENOENT') throw err
    return false
  }
}

const getChromiumPath = async (): Promise<string> => {
  const chromiumPath = process.env.CHROMIUM_PATH
  if (chromiumPath != null && chromiumPath !== '') return chromiumPath

  const platform = process.platform as 'win32' | 'darwin' | 'linux'

  const chromePath = {
    win32: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    linux: '/usr/bin/google-chrome'
  }[platform]

  if (await exists(chromePath)) return chromePath

  const edgePath = {
    win32: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    darwin: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    linux: '/usr/bin/microsoft-edge'
  }[platform]

  if (await exists(edgePath)) return edgePath

  throw new Error('Unable to find executable chromium, Please use the `CHROMIUM_PATH` env to provide an executable path.')
}

const getOptions = async (): Promise<Options> => {
  if (process.env.AWS_REGION == null) {
    return { headless: true, executablePath: await getChromiumPath() }
  }

  // load all fonts
  const fontDir = path.join(__dirname, '../fonts')
  const fontFiles = await fs.readdir(fontDir)
  await Promise.all(fontFiles.map(async item => await chromium.font(path.join(fontDir, item))))

  return {
    headless: chromium.headless,
    executablePath: await chromium.executablePath,
    args: chromium.args
  }
}

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

  const options = await getOptions()
  const browser = await puppeteer.launch(options)
  const page = await browser.newPage()
  await page.setViewport({ width, height, deviceScaleFactor })
  await page.setContent(html)
  const buffer = await page.screenshot({ fullPage: true })
  await browser.close()

  res.setHeader('content-type', 'image/png')
  res.send(buffer)
}
