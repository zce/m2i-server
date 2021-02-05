# m2i-server

> A service to convert markdown to image.

## Endpoints

### GET `/api`

convert markdown to image.

```shell
$ curl -X POST https://m2i.vercel.app/api
```

#### Request

- `markdown`: markdown document
- `width`: output image width, default: `800`
- `template`: output html template, default: `'<link rel="stylesheet" href="https://unpkg.com/github-markdown-css"><div class="markdown-body" style="padding: 2.5em">{{markdown}}</div>'`

#### Response

Rendered image.

## Related

- [zce/m2i](https://github.com/zce/m2i) - A minimalist CLI markdown to image converter.

## License

[MIT](LICENSE) &copy; [zce](https://zce.me)
