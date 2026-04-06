## fastlane documentation

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## Android

### android doctor

```sh
[bundle exec] fastlane android doctor
```

Check environment readiness and CLI dependencies

### android bump_version

```sh
[bundle exec] fastlane android bump_version
```

Automate versioning: Increment patch and sync app.json

### android trigger_release

```sh
[bundle exec] fastlane android trigger_release
```

Lệnh Khai Hỏa (Local): Tăng version, Commit, Đánh Tag và Push lên GitHub

### android upload_to_playstore

```sh
[bundle exec] fastlane android upload_to_playstore
```

Lệnh Giao Hàng (CI/CD): Lấy file .aab ném lên Google Play Console

---

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
