/**
 * @file OSS Sign
 * @author Yourtion Guo <yourtion@gmail.com>
 */

import assert from "assert";
import crypto from "crypto";

export interface IOption {
  /** 秘钥ID */
  accessKeyId: string;
  /** 秘钥Key */
  accessKeySecret: string;
  /** 默认过期时间（毫秒，默认30s） */
  expire?: number;
  /** 默认上传路径前缀（末尾包含 / ） */
  defaultDir?: string;
  /** 默认最大文件大小（字节） */
  maxSize?: number;
}

export interface ISignOption {
  /** 目录前缀（包含 / ）*/
  dir?: string;
  /** 过期时间（毫秒） */
  expire?: number;
  /** 文件最大尺寸（字节） */
  maxSize?: number;
}

export interface ISignResult {
  /** 策略 */
  policy: string;
  /** 签名 */
  signature: string;
  /** 过期时间（毫秒） */
  expire: number;
  /** 密钥ID */
  accessid: string;
  /** 上传host */
  host?: string;
  /** 前缀 */
  dir?: string;
  /** 上传的key */
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
  private defaultDir?: string;
  private maxSize?: number;

  constructor(options: IOption) {
    assert(typeof options.accessKeyId === "string", "请配置 AccessKeyId");
    assert(typeof options.accessKeySecret === "string", "请配置 AccessKeySecret");
    this.accessKeyId = options.accessKeyId;
    this.accessKeySecret = options.accessKeySecret;
    this.expire = options.expire || 30 * 1000;
    this.defaultDir = options.defaultDir;
    this.maxSize = options.maxSize;
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
      dir: prefix,
      key: (prefix || "") + (filename || "")
    };
  }
}
