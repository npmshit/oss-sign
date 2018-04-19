
import OSSSign from "./index";

const cli = new OSSSign({
  accessKeyId: "6MKOqxGiGU4AUk44",
  accessKeySecret: "ufu7nS8kS59awNihtjSonMETLI0KLy",
  endpoint: "http://post-test.oss-cn-hangzhou.aliyuncs.com",
  defaultDir: "user-dir/"
});

console.log(cli.sign());
