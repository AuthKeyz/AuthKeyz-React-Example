# AuthKeyz React Example : Please star 🌟

AuthKeyz React/Next.js TypeScript example application with full 2FA support for https://authkeyz.bond license key API auth.

**Built with Next.js 14, React 18, TypeScript, and Tailwind CSS**

**Uses [bun](https://bun.sh) runtime for optimal performance - highly recommended over npm/yarn.**

## **Features**

- 🔐 **Complete Authentication System** - Login with username/password or license key
- 🛡️ **Two-Factor Authentication (2FA)** - Full 2FA support with QR code setup
- 🎨 **Modern UI** - Clean, responsive design matching AuthKeyz branding
- ⚡ **Next.js 14** - Latest Next.js with App Router and server components
- 🔒 **Secure Session Management** - Cookie-based authentication with context
- 📱 **Mobile Responsive** - Works seamlessly on all device sizes
- 🚀 **TypeScript** - Full type safety throughout the application

## **Installation & Setup**

1. **Clone the repository**
   ```bash
   git clone https://github.com/AuthKeyz/AuthKeyz-React-Example.git
   cd AuthKeyz-React-Example
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Configure your AuthKeyz application**
   
   Edit `src/credentials.ts` with your AuthKeyz application details:
   ```typescript
    export const name: string = ""; // Application name
    export const ownerid: string = ""; // Owner ID
    export const url: string = "https://authkeyz.bond/api/1.3/"; // API URL (change if self-hosted)
   ```

4. **Run the development server**
   ```bash
   bun dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## **Bugs**

If you are using our example with no significant changes and having problems, please report bugs here: https://authkeyz.fdback.io

However, we do **NOT** provide support for adding AuthKeyz to your project. If you can't figure this out, use Google or YouTube to learn more about React/Next.js development.

## **Application Structure**

```
src/
├── app/
│   ├── page.tsx              # Main login page
│   ├── dashboard/
│   │   └── page.tsx          # User dashboard
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── Login.tsx             # Login component with 2FA support
│   ├── TwoFALogin.tsx        # 2FA verification component
│   └── TwoFASetup.tsx        # 2FA setup/disable modal
├── contexts/
│   └── AuthContext.tsx       # Authentication context provider
├── lib/
│   ├── authkeyz.ts            # AuthKeyz API client
│   └── cookies.ts            # Cookie management utilities
└── credentials.ts            # Application credentials
```

## **Authentication Features**

### **Standard Login**
Users can authenticate using username/password:

```typescript
// In your component
const { login, loading, error } = useAuth();

const handleLogin = async () => {
  await login(username, password);
};
```

### **License Key Authentication**
Direct authentication with license keys:

```typescript
const { licenseAuth } = useAuth();

const handleLicenseLogin = async () => {
  await licenseAuth(licenseKey);
};
```

### **Two-Factor Authentication (2FA)**

#### **Enable 2FA**
```typescript
const { enable2FA } = useAuth();

// This returns a QR code URL for the user to scan
const result = await enable2FA();
if (result.success) {
  // Show QR code: result.qr
}
```

#### **Login with 2FA**
When 2FA is enabled, the login flow automatically detects and redirects to 2FA verification:

```typescript
const { loginWith2FA } = useAuth();

const handleVerify2FA = async (code: string) => {
  await loginWith2FA(username, password, code);
};
```

#### **Disable 2FA**
```typescript
const { disable2FA } = useAuth();

const handleDisable2FA = async () => {
  await disable2FA();
};
```

## **User Registration**

```typescript
const { register } = useAuth();

const handleRegister = async () => {
  await register(username, password, licenseKey);
};
```

## **Account Upgrade**

Users can upgrade their accounts with additional license keys:

```typescript
const { upgrade } = useAuth();

const handleUpgrade = async () => {
  const result = await upgrade(username, licenseKey);
  if (result.success) {
    // Show success message
  } else {
    // Show error: result.message
  }
};
```

## **User Data Access**

Access current user information through the context:

```typescript
const { user, isLoggedIn } = useAuth();

// User object contains:
console.log({
  username: user?.username,
  email: user?.email,
  ip: user?.ip,
  hwid: user?.hwid,
  expires: user?.expires,
  subscriptions: user?.subscriptions,
  createdate: user?.createdate,
  lastlogin: user?.lastlogin
});
```

## **Application Information**

Display app statistics:

```typescript
const { authkeyz } = useAuth();

// Access app data
const appData = authkeyz?.app_data;

console.log({
  numUsers: appData?.numUsers,
  onlineUsers: appData?.onlineUsers,
  numKeys: appData?.numKeys,
  version: appData?.app_ver,
  customerPanel: appData?.customer_panel
});
```

## **Session Management**

```typescript
const { logout, authkeyz } = useAuth();

// Check if session is valid
const isValid = await authkeyz?.check();

// Logout user
logout();
```

## **Security Features**

### **Blacklist Check**
```typescript
const { authkeyz } = useAuth();

const isBlacklisted = await authkeyz?.checkblacklist();
if (isBlacklisted) {
  // Handle blacklisted user
}
```

### **Ban User**
```typescript
const { authkeyz } = useAuth();

// Ban current user (must be logged in)
await authkeyz?.ban();
```

## **Logging**

Send logs to AuthKeyz dashboard:

```typescript
const { authkeyz } = useAuth();

await authkeyz?.log("User performed action X");
```

## **Variables**

### **Application Variables**
```typescript
const { authkeyz } = useAuth();

const value = await authkeyz?.var("variableName");
```

### **User Variables**
```typescript
const { authkeyz } = useAuth();

// Get user variable
const userValue = await authkeyz?.getvar("varName");

// Set user variable
await authkeyz?.setvar("varName", "varValue");
```

## **File Downloads**

```typescript
const { authkeyz } = useAuth();

const fileBytes = await authkeyz?.file("fileId");
// Handle file bytes as needed
```

## **Chat System**

### **Get Chat Messages**
```typescript
const { authkeyz } = useAuth();

const messages = await authkeyz?.chatGet("channelName");
messages?.forEach(msg => {
  console.log(`${msg.author}: ${msg.message}`);
});
```

### **Send Chat Message**
```typescript
const { authkeyz } = useAuth();

await authkeyz?.chatSend("Hello everyone!", "channelName");
```

## **Webhooks**

Send secure server-side requests:

```typescript
const { authkeyz } = useAuth();

// GET request
const response1 = await authkeyz?.webhook("webhookId", "&param=value");

// POST with form data
const response2 = await authkeyz?.webhook(
  "webhookId", 
  "", 
  "key=value&key2=value2", 
  "application/x-www-form-urlencoded"
);

// POST with JSON
const response3 = await authkeyz?.webhook(
  "webhookId",
  "",
  JSON.stringify({ message: "Hello" }),
  "application/json"
);
```

## **Environment Configuration**

### **Development**
```bash
bun dev
```

### **Production Build**
```bash
bun run build
bun start
```

### **Type Checking**
```bash
bun run type-check
```

### **Linting**
```bash
bun run lint
```

## **Customization**

### **Styling**
The application uses Tailwind CSS with custom AuthKeyz design tokens. Main colors:

```css
/* Custom background colors */
.bg-custom-back { /* Dark background */ }
.bg-custom-back-1 { /* Darker background */ }

/* Custom hover effects */
.hover:bg-blue-700 { /* Button hovers */ }
```

### **Authentication Context**
The `AuthContext` provides all authentication state and methods. Wrap your app with `AuthProvider`:

```typescript
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

## **Customer Connection Issues**

This is common amongst all authentication systems. Program obfuscation causes false positives in virus scanners, and with the scale of AuthKeyz this is perceived as a malicious domain. So, `authkeyz.com` and `authkeyz.bond` have been blocked by many internet providers. For dashboard, reseller panel, customer panel, use `authkeyz.bond`.

For API, `authkeyz.bond` will not work because it's purposefully blocked there so `authkeyz.bond` doesn't get blocked also. You should create your own domain and follow this tutorial video: https://www.youtube.com/watch?v=a2SROFJ0eYc

## **What is AuthKeyz?**

AuthKeyz is a powerful cloud-based authentication system designed to protect your software from piracy and unauthorized access. With AuthKeyz, you can implement secure licensing, user management, and subscription systems in minutes. Client SDKs available for [C#](https://github.com/AuthKeyz/AuthKeyz-CSHARP-Example), [C++ (API 1.3)](https://github.com/AuthKeyz/AuthKeyz-CPP-Example-API_1.3), [C++ (API 1.2)](https://github.com/AuthKeyz/AuthKeyz-CPP-Example-API_1.2), [Python](https://github.com/AuthKeyz/AuthKeyz-Python-Example), [Java](https://github.com/AuthKeyz/AuthKeyz-JAVA-api), [JavaScript](https://github.com/AuthKeyz/AuthKeyz-JavaScript-Example), [VB.NET](https://github.com/AuthKeyz/AuthKeyz-VB-Example), [PHP](https://github.com/AuthKeyz/AuthKeyz-PHP-Example), [Rust](https://github.com/AuthKeyz/AuthKeyz-Rust-Example), [Go](https://github.com/AuthKeyz/AuthKeyz-Go-Example), [Lua](https://github.com/AuthKeyz/AuthKeyz-Lua-Examples), [Ruby](https://github.com/AuthKeyz/AuthKeyz-Ruby-Example), and [Perl](https://github.com/AuthKeyz/AuthKeyz-Perl-Example). 

AuthKeyz has several unique features such as memory streaming, webhook function where you can send requests to API without leaking the API, discord webhook notifications, ban the user securely through the application at your discretion. Feel free to join https://discord.gg/KNRpCwWANJ if you have questions or suggestions.

## **Copyright License**

AuthKeyz is licensed under **Elastic License 2.0**

* You may not provide the software to third parties as a hosted or managed service, where the service provides users with access to any substantial set of the features or functionality of the software.

* You may not move, change, disable, or circumvent the license key functionality in the software, and you may not remove or obscure any functionality in the software that is protected by the license key.

* You may not alter, remove, or obscure any licensing, copyright, or other notices of the licensor in the software. Any use of the licensor's trademarks is subject to applicable law.

Thank you for your compliance, we work hard on the development of AuthKeyz and do not appreciate our copyright being infringed.

## **Support**

- 📖 [AuthKeyz Documentation](https://docs.authkeyz.bond)
- 💬 [Telegram Community](https://discord.gg/KNRpCwWANJ)
- 🐛 [Bug Reports](https://authkeyz.bond/app/?page=forms)
- 🌐 [AuthKeyz Dashboard](https://authkeyz.bond/app/)
