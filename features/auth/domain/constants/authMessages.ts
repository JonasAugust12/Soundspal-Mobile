export enum AuthToastTitle {
    Error = 'Lỗi',
    LoginFailed = 'Đăng nhập thất bại',
    RegisterFailed = 'Lỗi đăng ký',
    LoginError = 'Lỗi đăng nhập',
}

export enum AuthSuccessToast {
    LoginTitle = 'Đăng nhập thành công! 🎉',
    LoginBody = 'Chào mừng bạn trở lại.',
    RegisterTitle = 'Đăng ký thành công! 🎉',
    RegisterBody = 'Vui lòng kiểm tra email để xác thực tài khoản.',
    OAuthCompleteBody = 'Chào mừng bạn đến với Soundspal.',
    VerifyEmailTitle = 'Xác thực thành công! ✅',
    VerifyEmailBody = 'Tài khoản của bạn đã được xác thực.',
    VerifyResetCodeBody = 'Bạn có thể đặt lại mật khẩu mới.',
    ResetPasswordTitle = 'Đặt lại mật khẩu thành công! 🎉',
    ResetPasswordBody = 'Bạn có thể đăng nhập bằng mật khẩu mới.',
    ForgotPasswordTitle = 'Đã gửi mã! 📧',
    ForgotPasswordBody = 'Vui lòng kiểm tra email để nhận mã xác thực.',
    ResendCodeTitle = 'Đã gửi lại mã',
    ResendCodeBody = 'Vui lòng kiểm tra email của bạn.',
    LogoutTitle = 'Đăng xuất thành công! 👋',
    LogoutBody = 'Hẹn gặp lại bạn.',
}

export enum AuthGoogleError {
    MissingAuthCode = 'Không thể lấy mã xác thực từ Google. Vui lòng thử lại.',
}

export enum AuthLoadingLabel {
    Processing = 'Đang xử lý...',
    LoggingIn = 'Đang đăng nhập...',
    Registering = 'Đang đăng ký...',
    Sending = 'Đang gửi...',
    Verifying = 'Đang xác thực...',
    ResettingPassword = 'Đang đặt lại...',
    CompletingOAuth = 'Đang hoàn tất...',
    LoggingOut = 'Đang đăng xuất...',
}

export const AUTH_BRAND = {
    name: 'Soundspal',
    tagline: 'Kết nối tài năng âm nhạc',
} as const;

export const AUTH_COMMON = {
    back: 'Quay lại',
    or: 'HOẶC',
    continueWithGoogle: 'Tiếp tục với Google',
    termsOfService: 'Điều khoản dịch vụ',
    privacyPolicy: 'Chính sách bảo mật',
    login: 'Đăng nhập',
    register: 'Đăng ký',
    verify: 'Xác thực',
    forgotPasswordLink: 'Quên mật khẩu?',
    noAccount: 'Chưa có tài khoản?',
    registerNow: 'Đăng ký ngay',
    hasAccount: 'Đã có tài khoản?',
    rememberPassword: 'Nhớ mật khẩu rồi?',
    noCodeReceived: 'Không nhận được mã?',
    resendCode: 'Gửi lại mã',
    resendAfter: (seconds: number) => `Gửi lại sau ${seconds}s`,
    logout: 'Đăng xuất',
    skipVerifyLater: 'Bỏ qua, tôi sẽ xác thực sau',
} as const;

export const AUTH_LOGIN_UI = {
    welcome: 'Chào mừng trở lại! 👋',
    subtitle: 'Đăng nhập để tiếp tục khám phá',
    termsPrefix: 'Bằng việc đăng nhập, bạn đồng ý với',
    termsSuffix: 'của chúng tôi.',
    identifierLabel: 'Email hoặc Username',
    passwordLabel: 'Mật khẩu',
    identifierPlaceholder: 'user@example.com',
    passwordPlaceholder: '••••••••',
} as const;

export const AUTH_REGISTER_UI = {
    header: 'Tạo tài khoản mới',
    subtitle: 'Bắt đầu hành trình của bạn',
    title: 'Đăng ký Soundspal ✨',
    formSubtitle: 'Nhập thông tin để tạo tài khoản',
    termsPrefix: 'Bằng việc đăng ký, bạn đồng ý với',
    termsSuffix: 'của chúng tôi.',
    displayNameLabel: 'Tên hiển thị',
    displayNamePlaceholder: 'Nguyễn Văn A',
    usernameLabel: 'Username',
    usernamePlaceholder: 'nguyenvana',
    emailLabel: 'Email',
    roleLabel: 'Vai trò',
    confirmPasswordLabel: 'Xác nhận mật khẩu',
} as const;

export const AUTH_FORGOT_PASSWORD_UI = {
    title: 'Quên mật khẩu?',
    subtitle: 'Đừng lo, chúng tôi sẽ gửi mã xác thực qua email',
    emailPrompt: 'Nhập email của bạn',
    emailHint: 'Chúng tôi sẽ gửi mã 6 số để xác thực tài khoản',
    sendCode: 'Gửi mã xác thực',
} as const;

export const AUTH_VERIFY_RESET_UI = {
    title: 'Xác thực mã',
    subtitle: 'Nhập mã để đặt lại mật khẩu',
    otpTitle: 'Nhập mã 6 số',
    otpHint: 'Mã đã được gửi đến email của bạn',
    securityNote:
        '💡 Mã xác thực sẽ hết hạn sau 15 phút. Nếu không nhận được email, hãy kiểm tra thư mục spam.',
} as const;

export const AUTH_RESET_PASSWORD_UI = {
    title: 'Đặt mật khẩu mới',
    subtitle: 'Tạo mật khẩu mạnh để bảo vệ tài khoản',
    formTitle: 'Nhập mật khẩu mới',
    formHint: 'Mật khẩu cần có ít nhất 6 ký tự, gồm chữ hoa và chữ số',
    newPasswordLabel: 'Mật khẩu mới',
    resetButton: 'Đặt lại mật khẩu',
    tipsTitle: '💡 Mẹo tạo mật khẩu mạnh:',
    tipUpperLower: '• Kết hợp chữ hoa, chữ thường và số',
    tipSpecial: '• Sử dụng ký tự đặc biệt (@, #, $...)',
    tipPersonal: '• Tránh dùng thông tin cá nhân',
} as const;

export const AUTH_VERIFY_EMAIL_UI = {
    title: 'Xác thực email',
    subtitle: 'Kiểm tra hộp thư đến của bạn',
    otpTitle: 'Nhập mã 6 số',
    otpHint: 'Chúng tôi đã gửi mã xác thực đến email của bạn',
} as const;

export const AUTH_EMAIL_REQUIRED_UI = {
    header: 'Cần xác thực',
    subtitle: 'Tài khoản chưa được kích hoạt',
    title: 'Xác thực email 📧',
    body: 'Để sử dụng đầy đủ tính năng, vui lòng xác thực email của bạn',
    registeredEmail: 'Email đăng ký:',
    sendCode: 'Gửi mã xác thực',
    whyTitle: '💡 Tại sao cần xác thực?',
    whySecure: '• Bảo mật tài khoản của bạn',
    whyNotify: '• Nhận thông báo quan trọng qua email',
    whyRecover: '• Khôi phục mật khẩu khi cần thiết',
    footer: 'Không nhận được email? Kiểm tra thư mục spam hoặc liên hệ hỗ trợ',
} as const;

export const AUTH_OAUTH_UI = {
    header: 'Một bước nữa thôi!',
    subtitle: 'Hoàn tất thông tin để bắt đầu',
    providerBadge: 'Google Sign-In',
    title: 'Hoàn tất đăng ký ✨',
    formSubtitle: 'Chọn username và vai trò của bạn trên Soundspal',
    roleLabel: 'Bạn là',
    usernamePlaceholder: 'vd: nguyenvana_music',
    completeButton: 'Hoàn tất đăng ký',
    rolesTitle: '🎵 Về vai trò của bạn',
    producerDesc: 'Sáng tác, hòa âm, phối khí',
    singerDesc: 'Ca sĩ, nghệ sĩ biểu diễn',
    venueDesc: 'Địa điểm tổ chức sự kiện',
    footer: 'Bạn có thể thay đổi thông tin này sau trong phần cài đặt',
} as const;

export const AUTH_USER_ROLES = [
    { label: 'Producer', value: 'producer' as const },
    { label: 'Singer', value: 'singer' as const },
    { label: 'Venue', value: 'venue' as const },
] as const;
