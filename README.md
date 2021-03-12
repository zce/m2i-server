# m2i-server

> A service to convert markdown to image.

## Endpoints

### GET `/api`

convert markdown to image.

```shell
$ curl -X POST https://m2i.vercel.app/api
```

#### Request

- `markdown`: markdown document content
- `width`: viewport width, default: `600`
- `scale`: device scale factor: `2`
- `template`: output html template, default: `'<link rel="stylesheet" href="https://cdn.zce.me/markdown.css">{{markdown}}'`

#### Response

Rendered image.

## Related

- [zce/m2i](https://github.com/zce/m2i) - A minimalist CLI markdown to image converter.

## License

[MIT](LICENSE) &copy; [zce](https://zce.me)
