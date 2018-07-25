# oss-sign

阿里云OSS签名

```javascript
const OSSSign = require("@blueshit/oss-sign").default;

const signer = new OSSSign({
  accessKeyId: 'xxx',
  accessKeySecret: 'xxx',
  endpoint: 'http://xxx.oss-cn-hangzhou.aliyuncs.com',
})

/**
 * 获取 OSS 签名
 * @param {string} filename 文件名
 * @param {ISignOption} options 签名参数
 * @param {string} options.dir 目录前缀
 * @param {number} options.maxSize 文件最大尺寸（字节）
 * @param {number} options.expire 过期时间（秒）
 */
signer.sign('filename.jpg');
```

## 前端使用方法

参考： http://oss-demo.aliyuncs.com/oss-h5-upload-js-php/index.html

注意：**bucket必须设置了Cors(Post打勾）,不然没有办法上传**
