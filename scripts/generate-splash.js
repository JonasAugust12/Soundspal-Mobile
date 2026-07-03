/**
 * Regenerate Soundspal-Splash.png with safe padding for Android 12+ splash API (200x80 dp).
 * Run: node scripts/generate-splash.js
 * Requires: npm install --no-save sharp
 */
const sharp = require('sharp');

const LOGO_PATH = 'assets/images/Soundspal-TextLogo.png';
const OUT_PATH = 'assets/images/Soundspal-Splash.png';
const CANVAS_W = 400;
const CANVAS_H = 160;
const MAX_LOGO_W = 320;
const MAX_LOGO_H = 64;

async function generateSplash() {
    const resized = await sharp(LOGO_PATH)
        .resize(MAX_LOGO_W, MAX_LOGO_H, { fit: 'inside' })
        .toBuffer();
    const { width, height } = await sharp(resized).metadata();
    const left = Math.floor((CANVAS_W - width) / 2);
    const top = Math.floor((CANVAS_H - height) / 2);

    await sharp({
        create: {
            width: CANVAS_W,
            height: CANVAS_H,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 1 },
        },
    })
        .composite([{ input: resized, left, top }])
        .png()
        .toFile(OUT_PATH);

    console.log(`Created ${OUT_PATH} (${CANVAS_W}x${CANVAS_H}), logo ${width}x${height}`);
}

generateSplash().catch((error) => {
    console.error(error);
    process.exit(1);
});
