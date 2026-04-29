# Adolat AI 🏛️

O'zbekiston fuqarolari uchun huquqiy AI assistant.

## Tezkor boshlash

```bash
cd AdolatAI
npm install
cp .env.example .env
# .env ga EXPO_PUBLIC_OPENAI_API_KEY=sk-... yozing
npm start
```

## Demo login

| Rol | Login | Parol |
|-----|-------|-------|
| Admin | `admin` | `admin123` |
| User | `user@test.com` | `password123` |

## Ekranlar (29 ta)
- Auth: Onboarding, Login, Register, ForgotPassword, VerifyCode
- User: Home
- Chat: ChatList, ChatDetail, VoiceAdvisor
- Documents: Documents, Analysis, GenerateDocument
- Subscription: Subscription, Payment
- Profile: Profile, Edit, Settings, Language, ChangePassword, PaymentHistory, Support, About
- Admin: Dashboard, Users, UserDetails, Tariffs, PromoCodes, Analytics, AdminProfile

## Build

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```
