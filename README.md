# 💎 Jewellery Frontend

A modern, responsive React/Vite frontend application for a jewellery e-commerce platform with advanced state management, real-time data fetching, and beautiful UI.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Features Guide](#features-guide)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## ✨ Features

- **React 19** - Latest React with hooks
- **Vite Build Tool** - Lightning-fast development and production builds
- **TanStack React Query** - Powerful server state management
- **Advanced Forms** - React Hook Form with Zod validation
- **Real-time Notifications** - React Hot Toast for user feedback
- **Recharts** - Beautiful data visualization
- **PDF Export** - Generate PDFs with html2canvas and jsPDF
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Authentication** - JWT token handling with auto-refresh
- **Smooth Animations** - Framer Motion for engaging UI

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | ^19.2.0 | UI Framework |
| Vite | ^7.3.1 | Build tool |
| TanStack React Query | ^5.90.21 | Server state management |
| React Router | ^7.13.0 | Client-side routing |
| React Hook Form | ^7.71.1 | Form state management |
| Tailwind CSS | ^3.4.4 | Utility CSS |
| Framer Motion | ^12.34.1 | Animations |
| Axios | ^1.13.5 | HTTP client |
| Recharts | ^3.7.0 | Data visualization |

## 📦 Prerequisites

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (v6 or higher) or **yarn**
- **Git** - [Download](https://git-scm.com/)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/PratikDate01/Jwellery_Frontend.git
   cd Jwellery_Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Create environment configuration**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   VITE_API_TIMEOUT=30000
   ```

## 🚀 Getting Started

### Development Mode

Start the development server:

```bash
npm run dev
```

The application opens at `http://localhost:5173`

### Production Build

Create an optimized production build:

```bash
npm run build
```

The build artifacts are in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Linting

Check code quality:

```bash
npm run lint
```

## 📁 Project Structure

```
Jwellery_Frontend/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom hooks
│   ├── services/         # API services
│   ├── context/          # Context API
│   ├── utils/            # Utility functions
│   ├── styles/           # Global styles
│   ├── App.jsx           # Main component
│   └── main.jsx          # Entry point
├── .env.example          # Environment template
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind config
├── package.json          # Dependencies
└── README.md            # This file
```

## 📜 Available Scripts

### `npm run dev`
Runs development server with hot module reload.

### `npm run build`
Creates optimized production build.

### `npm run preview`
Preview production build locally.

### `npm run lint`
Check code quality with ESLint.

## ⚙️ Configuration

### Environment Variables

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_TIMEOUT=30000

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENV=development
```

### Tailwind CSS Customization

Edit `tailwind.config.js`:

```javascript
export default {
  theme: {
    extend: {
      colors: {
        primary: '#your-color',
        secondary: '#your-color',
      },
    },
  },
}
```

### Vite Configuration

Customize `vite.config.js` for your needs:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000'
    }
  }
})
```

## 🎯 Features Guide

### TanStack React Query (Data Fetching)

```javascript
import { useQuery } from '@tanstack/react-query'

function Products() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetch('/api/products').then(r => r.json())
  })
  
  return // render data
}
```

### React Hook Form (Form Handling)

```javascript
import { useForm } from 'react-hook-form'

function ProductForm() {
  const { register, handleSubmit } = useForm()
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
    </form>
  )
}
```

### Hot Toast (Notifications)

```javascript
import toast from 'react-hot-toast'

toast.success('Product added successfully!')
toast.error('Failed to add product')
```

### Framer Motion (Animations)

```javascript
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
>
  Content
</motion.div>
```

## 🤝 Contributing

We welcome contributions!

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Code Style

- Use functional components with hooks
- Follow ESLint configuration
- Write meaningful commit messages
- Test before submitting PR

## 📄 License

Licensed under ISC License.

## 🆘 Support

- **Issues** - [GitHub Issues](https://github.com/PratikDate01/Jwellery_Frontend/issues)
- **Live Demo** - [Jewellery Frontend](https://jwellery-frontend-opal.vercel.app)

## 🔗 Related Projects

- [Jewellery Backend](https://github.com/PratikDate01/Jewellery_Backend)

---

Made with ❤️ by the Jewellery Team
