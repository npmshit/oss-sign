/**
 * @file OSS Sign
 * @link https://help.aliyun.com/document_detail/31988.html
 * @author Yourtion Guo <yourtion@gmail.com>
 */

import assert from "assert";
import crypto from "crypto";

export interface IOption {
  accessKeyId: string;
  accessKeySecret: string;
  endpoint?: string;
  expire?: number;
  defaultDir?: string;
}

export default class OSSSign {
  private accessKeyId: string;
  private accessKeySecret: string;
  private expire: number;
  private endpoint?: string;
  private defaultDir?: string;

  /**
   * 构造函数
   * @param {IOption} options - 配置项
   * @param {string} options.accessKeyId - 秘钥 AccessKeyId
   * @param {string} options.accessKeySecret - 秘钥A ccessKeySecret
   */
  constructor(options: IOption) {
    assert(typeof options.accessKeyId === "string", "请配置 AccessKeyId");
    assert(
      typeof options.accessKeySecret === "string",
      "请配置 AccessKeySecret"
    );
    this.accessKeyId = options.accessKeyId;
    this.accessKeySecret = options.accessKeySecret;
    this.endpoint = options.endpoint;
    this.expire = options.expire || 30 * 1000;
    this.defaultDir = options.defaultDir;
  }

  private getHash(data: string) {
    return crypto
      .createHmac("sha1", this.accessKeySecret)
      .update(data)
      .digest()
      .toString("base64");
  }

  public sign(filename?: string) {
    const expireAt = new Date().getTime() + this.expire;
    const expiration = new Date(expireAt).toISOString();
    const fielkey = filename
      ? this.defaultDir + "/" + filename
      : this.defaultDir;
    const policy = {
      expiration,
      conditions: [
        ["content-length-range", 0, 1048576000],
        ["starts-with", "$key", fielkey]
      ]
    };
    const policyStr = JSON.stringify(policy);
    const base64Policy = Buffer.from(policyStr).toString("base64");
    const signature = this.getHash(base64Policy);
    const expire = parseInt(String(expireAt / 1000), 10);
    return {
      policy: base64Policy,
      signature,
      expire,
      accessid: this.accessKeyId,
      host: this.endpoint,
      dir: this.defaultDir
    };
  }
}
