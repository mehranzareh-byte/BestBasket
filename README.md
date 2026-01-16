# BestBasket - Smart Grocery Shopping App

BestBasket is a market-scalable grocery shopping app that helps users find the best supermarkets based on price, quality, proximity, and availability. The app uses machine learning to provide personalized recommendations and continuously improves through user feedback and AI analysis.

## Features

### Core Functionality
- **Grocery List Management**: Create and manage your shopping lists
- **Smart Store Recommendations**: Get personalized store suggestions based on:
  - Price comparison
  - Quality index
  - Distance/proximity
  - Store hours (open/closed status)
  - Customizable preference weights
- **Bill Scanning**: Upload receipts to extract shopping data using OCR
- **Feedback System**: Submit feedback with AI-powered automatic improvement suggestions
- **Cross-Platform**: Works on web browsers, Android, and iOS

### Technical Features
- **ML-Powered Recommendations**: Machine learning model for optimal store matching
- **Data Collection**: Store shopping data from scanned bills for better future recommendations
- **AI Feedback Analysis**: Automatic suggestions for app improvements based on user feedback
- **Real-time Location Services**: Find nearby stores based on your location

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **OCR**: Tesseract.js for bill scanning
- **ML/AI**: Custom recommendation engine (ready for TensorFlow.js or Python backend)
- **Deployment**: Vercel (free hosting)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account (free tier available)
- Google Maps API key (optional, for enhanced location features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd BestBasket
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a free account at [supabase.com](https://supabase.com)
   - Create a new project
   - Run the SQL schema from `supabase-schema.sql` in the SQL editor
   - Copy your project URL and anon key

4. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key (optional)
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment

### Deploy to Vercel (Free)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables (same as `.env.local`)
   - Click "Deploy"

3. **Your app is live!**
   Vercel provides a free domain and SSL certificate.

### Alternative Free Hosting Options

- **Netlify**: Similar to Vercel, supports Next.js
- **Railway**: Free tier with PostgreSQL included
- **Render**: Free tier for web services

## Project Structure

```
BestBasket/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── bills/         # Bill scanning endpoints
│   │   ├── feedback/      # Feedback endpoints
│   │   └── recommendations/ # ML recommendation endpoint
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Navigation.tsx
│   ├── GroceryList.tsx
│   ├── StoreRecommendations.tsx
│   ├── BillScanner.tsx
│   └── FeedbackSystem.tsx
├── lib/                   # Utilities and helpers
│   ├── supabase.ts       # Supabase client
│   └── ml-model.ts       # ML model functions
├── supabase-schema.sql   # Database schema
└── package.json
```

## Database Schema

The app uses Supabase (PostgreSQL) with the following main tables:
- `profiles`: User profiles
- `grocery_lists`: User shopping lists
- `grocery_items`: Items in lists
- `stores`: Store information
- `bills`: Scanned receipts
- `store_prices`: Historical price data for ML
- `feedback`: User feedback
- `ai_suggestions`: AI-generated improvement suggestions

See `supabase-schema.sql` for the complete schema.

## ML Model

The recommendation system uses a weighted scoring algorithm that considers:
- **Price Score**: Based on historical price data
- **Quality Score**: Based on user reviews and ratings
- **Distance Score**: Based on proximity to user location

The model can be enhanced with:
- TensorFlow.js for client-side predictions
- Python backend (Flask/FastAPI) for complex models
- Pre-trained models for price prediction

## Future Enhancements

- [ ] User authentication and profiles
- [ ] Real-time price updates from store APIs
- [ ] Advanced ML model training pipeline
- [ ] Mobile apps (React Native)
- [ ] Push notifications for deals
- [ ] Social features (share lists, compare prices)
- [ ] Integration with delivery services
- [ ] Multi-language support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ for smarter grocery shopping
