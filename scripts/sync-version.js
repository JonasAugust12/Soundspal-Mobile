const fs = require('fs');
const path = require('path');

// __dirname là thư mục 'scripts'. '..' sẽ đưa chúng ta ra thư mục gốc 'TL-Mobile'
const rootDir = path.resolve(__dirname, '..');
const pkgPath = path.join(rootDir, 'package.json');
const appConfigPath = path.join(rootDir, 'app.json');

try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const appConfig = JSON.parse(fs.readFileSync(appConfigPath, 'utf8'));

    // Đồng bộ version
    appConfig.expo.version = pkg.version;

    // Tăng versionCode cho Android
    if (appConfig.expo.android && typeof appConfig.expo.android.versionCode === 'number') {
        appConfig.expo.android.versionCode += 1;
    }

    fs.writeFileSync(appConfigPath, JSON.stringify(appConfig, null, 2));
    console.log(`✅ Version synced: ${pkg.version}`);
} catch (error) {
    console.error(`❌ Sync failed: ${error.message}`);
    process.exit(1);
}
