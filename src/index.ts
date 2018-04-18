/**
 * @file OSS Sign
 * @author Yourtion Guo <yourtion@gmail.com>
 */

import assert from "assert";
import crypto from "crypto";

export interface IOption {
  accessKeyId: string;
  accessKeySecret: string;
  host: string;
  expire?: number;
  defaultDir?: string;
}

export default class OSSSign {
  private accessKeyId: string;
  private accessKeySecret: string;
  private host: string;
  private expire: number;
  private defaultDir: string;

  /**
   * 构造函数
   * @param {IOption} options - 配置项
   * @param {string} options.AccessKeyId - 秘钥 AccessKeyId
   * @param {string} options.AccessKeySecret - 秘钥A ccessKeySecret
   */
  constructor(options: IOption) {
    assert(typeof options.accessKeyId === "string", "请配置 AccessKeyId");
    assert(
      typeof options.accessKeySecret === "string",
      "请配置 AccessKeySecret"
    );
    assert(typeof options.host === "string", "请配置 host");
    this.accessKeyId = options.accessKeyId;
    this.accessKeySecret = options.accessKeySecret;
    this.host = options.host;
    this.expire = options.expire || 30 * 1000;
    this.defaultDir = options.defaultDir || "/";
  }

  private getHash(data: string) {
    return crypto
      .createHmac("sha1", this.accessKeySecret)
      .update(data)
      .digest()
      .toString("base64");
  }

  public sign(filename: string) {
    const expireAt = new Date().getTime() + this.expire;
    const expiration = new Date(expireAt).toISOString().split(".")[0] + "Z";
    const policy = {
      expiration,
      conditions: [
        ["content-length-range", 0, 1048576000],
        ["starts-with", this.defaultDir]
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
      host: this.host,
      dir: this.defaultDir
    };
  }
}
