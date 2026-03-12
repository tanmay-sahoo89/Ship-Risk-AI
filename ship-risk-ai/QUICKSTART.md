# Ship Risk AI - Quick Start Guide

## 📦 Installation (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Create config file
cp .env.example .env.local

# 3. Start development server
npm run dev

# 4. Open browser
# http://localhost:5173
```

## ⚙️ Configuration

Edit `.env.local` with your settings:

### Firebase (Optional - App works without it)

```
VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### Backend API

```
VITE_API_BASE_URL=http://localhost:5000/api
```

## 🧪 Testing

```bash
# Run tests
npm test

# Interactive test UI
npm run test:ui

# Coverage report
npm run coverage
```

## 🚀 Build for Production

```bash
# Build
npm run build

# Preview build
npm run preview

# Deploy dist/ folder to hosting
```

## 📚 Full Documentation

- **Setup & Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Testing Guide**: [TESTING.md](./TESTING.md)
- **API Integration**: See DEPLOYMENT.md

## 🎨 Available Commands

| Command            | Purpose            |
| ------------------ | ------------------ |
| `npm run dev`      | Start dev server   |
| `npm run build`    | Production build   |
| `npm test`         | Run tests          |
| `npm run test:ui`  | Test dashboard     |
| `npm run coverage` | Coverage report    |
| `npm run lint`     | Check code quality |
| `npm run preview`  | Preview build      |

## 🔑 Key Features

- ✅ Real-time shipment risk monitoring
- ✅ Smart alerts & recommendations
- ✅ Data export (CSV/PDF)
- ✅ Dark mode
- ✅ Firebase authentication ready
- ✅ Responsive design
- ✅ Error handling

## 🔐 Firebase Setup (Optional)

1. Go to [firebase.google.com](https://firebase.google.com)
2. Create project → Enable Auth → Create Firestore
3. Copy credentials to `.env.local`

Full guide: [DEPLOYMENT.md](./DEPLOYMENT.md#firebase-integration-setup-instructions)

## 🚢 Deployment

### Vercel (Recommended - 1 minute)

```bash
vercel
```

### Netlify

```bash
netlify deploy --prod --dir=dist
```

### Traditional Hosting

- Run `npm run build`
- Upload `dist/` folder to hosting

## ❓ Troubleshooting

**Port 5173 already in use?**

```bash
# macOS/Linux:
lsof -ti:5173 | xargs kill -9

# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

**Build errors?**

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Firebase not working?**

- Verify `.env.local` has all 6 Firebase variables
- Check Firebase Console credentials are correct

## 📈 Project Status

✅ **Completed**:

- All UI components
- Dark mode
- Data export
- Error boundaries
- Lazy loading
- Testing framework
- Firebase integration
- Documentation

⏳ **Waiting For**:

- Backend API connection
- Real shipment data
- Firebase credentials

## 🎯 Next Steps

1. **Backend**: Connect to Python API endpoints
2. **Firebase**: Add project credentials to `.env.local`
3. **Deploy**: Push `dist/` folder to hosting
4. **Monitor**: Set up error tracking

## 📞 Need Help?

- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for setup issues
- Check [TESTING.md](./TESTING.md) for testing help
- Review component comments for usage
- Check TypeScript types for API contracts

---

**Ready to ship!** 🚀
