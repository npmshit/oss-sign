import OSSSign from "./index";

const cli = new OSSSign({
  accessKeyId: "6MKOqxGiGU4AUk44",
  accessKeySecret: "ufu7nS8kS59awNihtjSonMETLI0KLy",
  defaultDir: "user-dir/"
});

const token = cli.sign("icon-excel.png", {
  maxSize: 1000000,
});

console.log(token);

import http from "http";
import fs from "fs";
import util from "util";
import path from "path";

var BOUNDARYPREFIX = "------WebKitFormBoundary";

function mkpic(pic: string, fn: any) {
  var mimes: any = {
    ".png": "image/png",
    ".gif": "image/gif",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg"
  };
  var ext = path.extname(pic);
  var mime = mimes[ext];
  if (!mime) return;

  fs.readFile("/Users/Yourtion/Downloads/" + pic, function(err, data) {
    let content = util.format('Content-Disposition: form-data; name="file"; filename="%s"\r\n', pic);
    content += util.format("Content-Type: %s\r\n\r\n", mime);
    content += data;
    fn(content);
  });
}

function mkfield(field: string, value: string) {
  return util.format('Content-Disposition: form-data; name="%s"\r\n\r\n%s', field, value);
}

function getBody(param: any, cb: any) {
  if (param.file) {
    mkpic(param.file, (file: any) => {
      const data = [];
      delete param.file;
      for (const i in param) {
        data.push(mkfield(i, param[i]));
      }

      const max = 9007199254740992;
      const dec = Math.random() * max;
      const hex = dec.toString(36);
      const boundary = BOUNDARYPREFIX + hex;

      data.push(file);
      const body =
        util.format("--%s\r\n", boundary) +
        data.join(util.format("\r\n--%s\r\n", boundary)) +
        util.format("\r\n--%s--", boundary);
      cb(body, boundary);
    });
  }
}

getBody(
  {
    name: "icon-excel.png",
    key: "user-dir/icon-excel.png",
    policy: token.policy,
    OSSAccessKeyId: token.accessid,
    success_action_status: 200,
    signature: token.signature,
    file: "icon-excel.png"
  },
  (body: any, bound: any) => {
    post(body, bound);
  }
);

function post(payload: any, boundary: any) {
  var options = {
    host: "post-test.oss-cn-hangzhou.aliyuncs.com",
    port: 80,
    method: "POST"
  };
  var reqHttps = http.request(options, function(resHttps) {
    console.log("statusCode: ", resHttps.statusCode);
    console.log("headers: ", resHttps.headers);
    resHttps.on("data", function(body1) {
      console.log("body:" + body1);
    });
  });
  reqHttps.setHeader("Content-Type", "multipart/form-data; boundary=" + boundary);
  reqHttps.setHeader("Content-Length", Buffer.from(payload).length);
  reqHttps.write(payload);
  // console.log(reqHttps.getHeaders());
  reqHttps.on("error", function(e) {
    console.error("error:" + e);
  });
}
