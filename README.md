# m2i-server

> A service to convert markdown to image.

## Endpoints

### GET `/api`

Combine an email address.

```shell
$ curl https://m2i-server.vercel.app/api
```

#### Parameters

- `name`: email user name, alias: `username`
- `host`: email host, default: `'zce.me'`

#### Response Type

```json
{
  "name": "...",
  "email": "..."
}
```

## Related

<!-- TODO: related projects -->

## License

[MIT](LICENSE) &copy; [zce](https://zce.me)
