# oss-sign

阿里云OSS签名

```javascript
const OSSSign = require("@blueshit/oss-sign");

const signer = new OSSSign({
  accessKeyId: 'xxx',
  accessKeySecret: 'xxx',
  host: 'http://xxx.oss-cn-hangzhou.aliyuncs.com',
})
console.log(signer.sign())
```
