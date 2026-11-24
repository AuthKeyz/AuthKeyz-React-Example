import { Buffer } from "buffer";

interface AuthKeyzOptions {
  name: string;
  ownerid: string;
  url?: string;
  public_key?: string;
}

interface AuthKeyzUserData {
  username: string;
  ip: string;
  hwid: string;
  expires: number;
  createdate: number;
  lastlogin: number;
  subscription: string;
  subscriptions: string;
}

interface AuthKeyzAppData {
  numUsers: number;
  numKeys: number;
  app_ver: string;
  customer_panel: string;
  onlineUsers: number;
}

export default class AuthKeyz {
  private name: string;
  private ownerid: string;
  private url: string = "https://authkeyz.bond/api/1.3/";
  private public_key: string = "8e8d104f3ce9b29b411cfcf8e049d19fed42e63caa275e111bfa71ef3d237041";
  private loggingEnabled: boolean = true;

  private sessionid?: string;
  private initialized: boolean = false;
  
  public user_data: AuthKeyzUserData | null = null;
  public app_data: AuthKeyzAppData | null = null;

  constructor(options: AuthKeyzOptions) {
    this.name = options.name;
    this.ownerid = options.ownerid;
    this.url = options.url ?? "https://authkeyz.bond/api/1.3/";
    this.public_key = options.public_key ?? "8e8d104f3ce9b29b411cfcf8e049d19fed42e63caa275e111bfa71ef3d237041";

    if (!this.name || !this.ownerid) {
      throw new Error("Name and ownerid are required");
    }
  }

  async init() {
    if (this.sessionid && this.initialized) {
      return { success: true, message: "Application already initialized" };
    }

    let token: string = "";

    const post_data = {
      "type": "init",
      "name": this.name,
      "ownerid": this.ownerid,
    };

    const response = await this.__do_request(post_data) as any;

    if (response === "AuthKeyz_Invalid") {
      throw new Error("This application does not exist");
    }

    if (response["success"] === false) {
      throw new Error(response["message"]);
    }

    this.sessionid = response["sessionid"];
    this.initialized = true;
    return { success: true, message: "Application initialized successfully" };
  }

  async register(username: string, password: string, license: string) {
    this.checkinit();
    
    const post_data = {
      "type": "register",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
      "username": username,
      "pass": password,
      "key": license,
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      this.__load_user_data(response["info"]);
      return { success: true, message: response["message"], user_data: this.user_data };
    } else {
      return { success: false, message: response["message"] };
    }
  }

  async upgrade(username: string, license: string) {
    this.checkinit();
    
    const post_data = {
      "type": "upgrade",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
      "username": username,
      "key": license,
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      return { success: true, message: response["message"] + " Restart the application to apply the changes." };
    } else {
      return { success: false, message: response["message"] };
    }
  }

  async login(username: string, password: string, code?: string) {
    this.checkinit();
    
    const post_data = {
      "type": "login",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
      "username": username,
      "pass": password,

      ...code && { "code": code },
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      this.__load_user_data(response["info"]);
      return { success: true, message: response["message"], user_data: this.user_data };
    } else {
      return { success: false, message: response["message"] };
    }
  }

  async license(license: string, code?: string) {
    this.checkinit();
    
    const post_data = {
      "type": "license",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
      "key": license,

      ...code && { "code": code },
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      this.__load_user_data(response["info"]);
      return { success: true, message: response["message"], user_data: this.user_data };
    } else {
      return { success: false, message: response["message"] };
    }
  }

  async var(name: string) {
    this.checkinit();
    
    const post_data = {
      "type": "var",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
      "varid": name
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      return response["message"];
    } else {
      throw new Error(response["message"]);
    }
  }

  async getvar(name: string) {
    this.checkinit();
    
    const post_data = {
      "type": "getvar",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
      "var": name
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      return response["response"];
    } else {
      return null;
    }
  }

  async setvar(name: string, value: string) {
    this.checkinit();
    
    const post_data = {
      "type": "setvar",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
      "var": name,
      "data": value,
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      return true;
    } else {
      throw new Error(response["message"]);
    }
  }

  async ban() {
    this.checkinit();
    
    const post_data = {
      "type": "ban",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      return true;
    } else {
      throw new Error(response["message"]);
    }
  }

  async file(id: string) {
    this.checkinit();
    
    const post_data = {
      "type": "file",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
      "fileid": id
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      return Buffer.from(response["contents"], "hex");
    } else {
      throw new Error(response["message"]);
    }
  }

  async webhook(id: string, param: string, body?: string, conttype?: string) {
    this.checkinit();
    
    const post_data = {
      "type": "webhook",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
      "webid": id,
      "params": param,
      "body": body,
      "conttype": conttype,
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      return response["message"];
    } else {
      throw new Error(response["message"]);
    }
  }

  async check() {
    this.checkinit();
    
    const post_data = {
      "type": "check",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      return true;
    } else {
      return false;
    }
  }

  async checkblacklist() {
    this.checkinit();
    
    const post_data = {
      "type": "checkblacklist",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      return true;
    } else {
      return false;
    }
  }

  async log(message: string) {
    this.checkinit();
    
    const post_data = {
      "type": "log",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
      "message": message,
      "pcuser": "WebUser", // Browser environment doesn't have os.userInfo()
    };

    await this.__do_request(post_data) as any;
  }

  async fetchOnline() {
    this.checkinit();
    
    const post_data = {
      "type": "fetchOnline",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      if (Number(response["users"]) === 0) {
        return null;
      } else {
        return Number(response["users"]);
      }
    } else {
      return false;
    }
  }

  async fetchStats() {
    this.checkinit();
    
    const post_data = {
      "type": "fetchStats",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      this.__load_app_data(response["appinfo"]);
    }
  }

  async chatGet(channel: string) {
    this.checkinit();
    
    const post_data = {
      "type": "chatget",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
      "channel": channel,
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      return response["messages"];
    } else {
      return false;
    }
  }

  async chatSend(message: string, channel: string) {
    this.checkinit();
    
    const post_data = {
      "type": "chatsend",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
      "channel": channel,
      "message": message,
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      return true;
    } else {
      return false;
    }
  }

  async changeUsername(username: string) {
    this.checkinit();
    
    const post_data = {
      "type": "changeUsername",
      "newUsername": username,
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      return { success: true, message: "Username changed successfully" };
    } else {
      return { success: false, message: response["message"] || "Failed to change username" };
    }
  }

  async logout() {
    this.checkinit();
    
    const post_data = {
      "type": "logout",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      this.sessionid = undefined;
      this.initialized = false;
      this.user_data = null;
      return { success: true, message: "Logged out successfully" };
    } else {
      throw new Error(response["message"]);
    }
  }

  async enable2FA(code?: string) {
    this.checkinit();

    const post_data = {
      "type": "2faenable",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
      ...code && { "code": code },
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      return { 
        success: true, 
        message: response["message"],
        "2fa": response["2fa"] 
      };
    } else {
      return { success: false, message: response["message"] };
    }
  }

  async disable2FA(code: string) {
    this.checkinit();
    
    const post_data = {
      "type": "2fadisable",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
      "code": code,
    };

    const response = await this.__do_request(post_data) as any;

    return { success: response["success"], message: response["message"] };
  }

  async checkinit() {
    if (!this.sessionid && !this.initialized) {
      throw new Error("Application not initialized");
    }
  }

  private seenSignatures: Set<string> = new Set();
  public security_status = {
    ed25519Verified: false,
    replayGuardActive: true,
    lastClockDriftSec: 0,
  };

  private hexToBytes(hex: string): Uint8Array {
    const clean = hex.trim();
    if (clean.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(clean)) {
      throw new Error("Invalid hex encoding in cryptographic header");
    }
    const bytes = new Uint8Array(clean.length / 2);
    for (let i = 0; i < clean.length; i += 2) {
      bytes[i / 2] = parseInt(clean.substring(i, i + 2), 16);
    }
    return bytes;
  }

  private async verifyEd25519(rawBody: string, sigHex: string, timestamp: string): Promise<boolean> {
    if (!/^\d+$/.test(timestamp.trim())) {
      throw new Error("Invalid x-signature-timestamp format");
    }
    const serverTimeSec = Number(timestamp.trim());
    const nowSec = Math.floor(Date.now() / 1000);
    const drift = Math.abs(nowSec - serverTimeSec);
    this.security_status.lastClockDriftSec = drift;
    if (drift > 305) {
      throw new Error(`Clock skew too large (${drift}s). Please sync your device time.`);
    }

    const replayKey = `${timestamp.trim()}:${sigHex.trim().toLowerCase()}`;
    if (this.seenSignatures.has(replayKey)) {
      throw new Error("Replay attack detected: duplicate Ed25519 response signature.");
    }

    const pubKeyHex = this.public_key || "8e8d104f3ce9b29b411cfcf8e049d19fed42e63caa275e111bfa71ef3d237041";
    const pubKeyBytes = this.hexToBytes(pubKeyHex);
    const sigBytes = this.hexToBytes(sigHex);
    if (pubKeyBytes.length !== 32 || sigBytes.length !== 64) {
      return false;
    }

    const messageBytes = new TextEncoder().encode(timestamp.trim() + rawBody);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      pubKeyBytes.buffer as ArrayBuffer,
      { name: "Ed25519" },
      false,
      ["verify"]
    );
    const isValid = await crypto.subtle.verify(
      "Ed25519",
      cryptoKey,
      sigBytes.buffer as ArrayBuffer,
      messageBytes.buffer as ArrayBuffer
    );
    if (isValid) {
      this.seenSignatures.add(replayKey);
      this.security_status.ed25519Verified = true;
    }
    return isValid;
  }

  private async __do_request(data: any) {
    try {
      const response = await fetch(this.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        // @ts-ignore - Why does it error? No fucking clue but it works
        body: new URLSearchParams(data).toString(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const rawBody = await response.text();
      const responseData = JSON.parse(rawBody);
      const dontRunExtra = ["log", "file", "2faenable", "2fadisable"];
      if (dontRunExtra.includes(data.type)) {
        return responseData;
      }

      const edSig = response.headers.get("x-signature-ed25519");
      const edTs = response.headers.get("x-signature-timestamp");
      if (edSig && edTs) {
        const valid = await this.verifyEd25519(rawBody, edSig, edTs);
        if (!valid) {
          throw new Error("Ed25519 signature verification failed. Response may have been tampered with.");
        }
      }

      if (responseData && responseData.ownerid && responseData.ownerid !== this.ownerid) {
        throw new Error("Application ownerid mismatch in server response.");
      }

      return responseData;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Unexpected error: ${error}`);
    }
  }

  private redactField(content: string, field: string): string {
    const regex = new RegExp(`"${field}":\\s*".*?"`, "g");
    return content.replace(regex, `"${field}": "[REDACTED]"`);
  }

  private __load_app_data(data: any) {
    this.app_data = {
      numUsers: data["numUsers"],
      numKeys: data["numKeys"],
      app_ver: data["version"],
      customer_panel: data["customerPanelLink"],
      onlineUsers: data["numOnlineUsers"],
    }
  }

  private __load_user_data(data: any) {
    const firstSub = Array.isArray(data["subscriptions"]) && data["subscriptions"].length > 0
      ? data["subscriptions"][0]
      : null;
    this.user_data = {
      username: data["username"],
      ip: data["ip"],
      hwid: data["hwid"] || "N/A",
      expires: firstSub?.["expiry"] ?? 0,
      createdate: data["createdate"],
      lastlogin: data["lastlogin"],
      subscription: firstSub?.["subscription"] ?? "N/A",
      subscriptions: data["subscriptions"] ?? [],
    }
  }
}
