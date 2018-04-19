/**
 * @file OSS Sign
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
  maxSize?: number;
}

export interface ISignOption {
  dir?: string;
  expire?: number;
  maxSize?: number;
}

export interface ISignResult {
  policy: string;
  signature: string;
  expire: number;
  accessid: string;
  host?: string;
  dir?: string;
  key?: string;
}

interface IPolicys {
  expiration: string;
  conditions: Array<[string, string | number, string | number]>;
}

/**
 * OSS 签名类
 */
export default class OSSSign {
  private accessKeyId: string;
  private accessKeySecret: string;
  private expire: number;
  private endpoint?: string;
  private defaultDir?: string;
  private maxSize?: number;

  /**
   * 构造函数
   * @param {IOption} options 配置项
   * @param {string} options.accessKeyId 秘钥ID AccessKeyId
   * @param {string} options.accessKeySecret 秘钥Key AccessKeySecret
   * @param {string} options.endpoint OSS地址
   * @param {number} options.expire 默认过期时间（默认30s）
   * @param {string} options.defaultDir 默认上传路径前缀
   * @param {number} options.maxSize 默认最大文件大小（字节）
   */
  constructor(options: IOption) {
    assert(typeof options.accessKeyId === "string", "请配置 AccessKeyId");
    assert(typeof options.accessKeySecret === "string", "请配置 AccessKeySecret");
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
      .digest("base64");
  }

  /**
   * 获取 OSS 签名
   * @link https://help.aliyun.com/document_detail/31988.html
   * @param {string} filename 文件名
   * @param {ISignOption} options 签名参数
   * @param {string} options.dir 目录前缀
   * @param {number} options.maxSize 文件最大尺寸（字节）
   * @param {number} options.expire 过期时间（秒）
   */
  public sign(filename?: string, options: ISignOption = {}): ISignResult {
    const expireAt = new Date().getTime() + (options.expire || this.expire);
    const expiration = new Date(expireAt).toISOString();
    const policy: IPolicys = { expiration, conditions: [] };
    if (options.maxSize || this.maxSize) {
      policy.conditions.push(["content-length-range", 0, options.maxSize || this.maxSize!]);
    }
    const prefix = options.dir || this.defaultDir;
    if (filename) {
      // 存在文件名使用严格相等判断
      const fielkey = prefix ? prefix + filename : filename;
      policy.conditions.push(["eq", "$key", fielkey]);
    } else if (prefix) {
      // 存在目录使用key前缀限制
      policy.conditions.push(["starts-with", "$key", prefix]);
    }
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
      dir: prefix,
      key: (prefix || "") + (filename || "")
    };
  }
}
