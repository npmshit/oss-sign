# oss-sign

阿里云OSS签名

```javascript
const OSSSign = require("@blueshit/oss-sign");

const signer = new OSSSign({
  accessKeyId: 'xxx',
  accessKeySecret: 'xxx',
  endpoint: 'http://xxx.oss-cn-hangzhou.aliyuncs.com',
})
console.log(signer.sign())
```

## 前端使用方法

参考： http://oss-demo.aliyuncs.com/oss-h5-upload-js-php/index.html
