# Windows 打包代码签名配置

要让 `.exe` / `.msi` 安装时不再被 SmartScreen 拦截，必须在 **打包（`tauri build`）时** 对可执行文件做 **Authenticode 代码签名**。

Padora 的 GitHub Actions 已内置可选签名步骤；本地打包也可在 `tauri.conf.json` 中配置。

---

## 一、准备证书（打包前必做）

### 1. 购买代码签名证书

从微软认可的 CA 购买 **Code Signing** 证书（不是 SSL 网站证书）：

- [Microsoft 推荐列表](https://learn.microsoft.com/en-us/windows-hardware/drivers/dashboard/get-a-code-signing-certificate)
- 常见厂商：Sectigo、DigiCert、GlobalSign 等

| 类型 | SmartScreen | 价格（约） | 说明 |
| --- | --- | --- | --- |
| **OV 标准证书** | 需积累下载量/信誉，初期仍可能警告 | $200–400/年 | 个人/小团队常用 |
| **EV 扩展验证证书** | 通常更快获得 SmartScreen 信任 | $400–700/年 | 需 USB 令牌或云签名 |

### 2. 导出为 `.pfx` 文件

CA 签发后一般会给你 `.cer` + 私钥，或在浏览器/工具里直接导出 `.pfx`。

**若已有 `.cer` + `.key`，用 OpenSSL 合并：**

```powershell
openssl pkcs12 -export -in cert.cer -inkey private-key.key -out padora-sign.pfx
```

按提示设置 **导出密码**（后面 GitHub Secret 要用，务必保存）。

### 3. 获取证书指纹（Thumbprint）

在 **已导入证书的 Windows 电脑** 上：

1. `Win + R` → 输入 `certmgr.msc` → 回车  
2. **个人 → 证书** → 找到你的代码签名证书 → 双击  
3. **详细信息** 选项卡 → **指纹** → 复制（去掉空格，例如 `A1B2C3D4...`）

### 4. 将 `.pfx` 转为 Base64（给 GitHub Secrets 用）

在 `.pfx` 所在目录打开 PowerShell：

```powershell
certutil -encode padora-sign.pfx padora-sign-base64.txt
```

打开 `padora-sign-base64.txt`，复制 **BEGIN 与 END 之间的全部内容**（不含首尾两行标记也可，工作流用 certutil 解码）。

---

## 二、GitHub 仓库配置（CI 自动签名）

仓库已有 `.github/workflows/release.yml`，按下面配置后，**Windows 构建 job 会自动签名**。

### 1. 添加 Secrets

GitHub 仓库 → **Settings → Secrets and variables → Actions → Secrets → New repository secret**

| Secret 名称 | 值 |
| --- | --- |
| `WINDOWS_CERTIFICATE` | 上一步 Base64 编码的 `.pfx` 全文 |
| `WINDOWS_CERTIFICATE_PASSWORD` | 导出 `.pfx` 时设置的密码 |
| `WINDOWS_CERTIFICATE_THUMBPRINT` | 证书指纹（无空格） |

### 2. 添加 Variable（开关）

**Settings → Secrets and variables → Actions → Variables → New repository variable**

| 变量名 | 值 |
| --- | --- |
| `ENABLE_WINDOWS_SIGNING` | `true` |

> 未购买证书前保持不设置或设为 `false`，CI 仍正常打未签名包。

### 3. 重新发布

```bash
git tag v0.1.1
git push origin v0.1.1
```

或在 Actions 里手动 Run workflow。Windows job 日志中应出现类似：

```text
info: signing app
Successfully signed: ...
```

---

## 三、本地打包签名（可选）

若在本机 `pnpm tauri build`，需先把 `.pfx` 导入证书存储：

```powershell
$pwd = Read-Host "PFX password" -AsSecureString
Import-PfxCertificate -FilePath ".\padora-sign.pfx" `
  -CertStoreLocation Cert:\CurrentUser\My `
  -Password $pwd
```

在 `src-tauri/tauri.conf.json` 的 `bundle` 中加入（指纹换成你的）：

```json
"bundle": {
  "active": true,
  "targets": "all",
  "windows": {
    "certificateThumbprint": "你的证书指纹",
    "digestAlgorithm": "sha256",
    "timestampUrl": "http://timestamp.digicert.com"
  },
  ...
}
```

然后：

```bash
pnpm tauri build
```

---

## 四、验证签名是否成功

在 Windows 上对 Release 里的 exe 运行：

```powershell
Get-AuthenticodeSignature ".\Padora_0.1.0_x64-setup.exe" | Format-List
```

- **Status : Valid** → 签名成功  
- **Status : NotSigned** → 未签名，SmartScreen 仍会警告  

也可右键 exe → **属性** → **数字签名** 选项卡，应能看到你的发布者名称。

---

## 五、常见问题

**Q：签名后 SmartScreen 仍提示不安全？**  
A：OV 证书需要一定下载量积累信誉；EV 证书通常更快。已签名的包用户仍可能需点一次「仍要运行」，但会显示发布者名称。

**Q：没有证书能完全去掉警告吗？**  
A：不能。未签名只能让用户手动「解除锁定 + 仍要运行」，见 [README Windows 安装说明](../README.zh-CN.md#windows-安装说明)。

**Q：只签 exe 不签 msi？**  
A：Tauri 配置了 `certificateThumbprint` 后，会对 **主程序 exe 和安装包（exe/msi）** 一并签名。

**Q：macOS 也要签名？**  
A：是另一套流程（Apple Developer + 公证）。当前工作流仅配置了 Windows 可选签名。
