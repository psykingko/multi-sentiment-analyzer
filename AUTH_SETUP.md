# Authentication & Database Setup Guide

## 🚀 Quick Setup

### 1. Supabase Database Setup

1. **Create Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Sign up/Login and create a new project
   - Note down your project URL and API keys

2. **Run Database Schema:**
   - Go to your Supabase dashboard → SQL Editor
   - Copy and paste the contents of `database/schema.sql`
   - Execute the SQL to create tables and policies

### 2. OAuth Provider Setup

#### Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Set authorized redirect URI: `http://localhost:5173/api/auth/callback/google`
6. Copy Client ID and Client Secret

#### GitHub OAuth:
1. Go to [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set Homepage URL: `http://localhost:5173`
4. Set Authorization callback URL: `http://localhost:5173/api/auth/callback/github`
5. Copy Client ID and Client Secret

### 3. Environment Variables

1. **Copy the example file:**
   ```bash
   cp frontend/env.example frontend/.env.local
   ```

2. **Fill in your values:**
   ```env
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:5173
   NEXTAUTH_SECRET=your-random-secret-key-here

   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # GitHub OAuth
   GITHUB_ID=your-github-client-id
   GITHUB_SECRET=your-github-client-secret

   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   ```

### 4. Generate NextAuth Secret

```bash
# Generate a random secret
openssl rand -base64 32
```

## 🔧 Features Implemented

### ✅ Authentication
- **NextAuth.js** with Google & GitHub OAuth
- **Session management** with 30-day "Remember Me"
- **Secure JWT tokens**
- **User profile management**

### ✅ Database Integration
- **Supabase PostgreSQL** database
- **User profiles** storage
- **Analysis history** with full results
- **Row Level Security** (RLS) for data protection
- **Automatic user creation** on first login

### ✅ Frontend Features
- **Sleek login modal** with your dark theme
- **User profile display** in header
- **Recent analysis sidebar** on Text Analyzer page
- **Click to load** previous analyses
- **Delete analysis** functionality
- **Responsive design** for all screen sizes

### ✅ Data Persistence
- **Automatic saving** of analysis results
- **User-specific data** isolation
- **Analysis metadata** (model, timestamp, etc.)
- **Secure data access** with RLS policies

## 🎯 Usage

1. **Sign In:** Click "Sign In" in the header
2. **Choose Provider:** Google or GitHub OAuth
3. **Analyze Text:** Your analyses are automatically saved
4. **View History:** Check the sidebar on Text Analyzer page
5. **Load Previous:** Click any analysis to reload it
6. **Delete:** Hover over analysis and click trash icon

## 🔒 Security Features

- **Row Level Security** ensures users only see their data
- **JWT tokens** for secure session management
- **OAuth providers** handle password security
- **Environment variables** for sensitive configuration
- **CORS protection** on API endpoints

## 📊 Database Schema

### Users Table
- `id`: Unique user identifier
- `email`: User email (unique)
- `name`: Display name
- `image`: Profile picture URL
- `provider`: OAuth provider (google/github)
- `provider_id`: Provider's user ID
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

### Analysis History Table
- `id`: Unique analysis identifier
- `user_id`: Reference to user
- `text`: Analyzed text content
- `model`: Analysis model used (rule/deep)
- `results`: Full analysis results (JSONB)
- `summary`: Summary data (JSONB)
- `created_at`: Analysis timestamp

## 🚀 Next Steps

1. **Deploy to production** with proper environment variables
2. **Add more OAuth providers** (Microsoft, Discord, etc.)
3. **Implement user preferences** (default model, theme, etc.)
4. **Add data export** functionality
5. **Create team/organization** features
6. **Add premium features** with subscription management

## 🐛 Troubleshooting

### Common Issues:

1. **"Invalid redirect URI"**
   - Check OAuth provider settings
   - Ensure callback URLs match exactly

2. **"Database connection failed"**
   - Verify Supabase credentials
   - Check if tables exist in database

3. **"Session not persisting"**
   - Verify NEXTAUTH_SECRET is set
   - Check browser cookie settings

4. **"Analysis not saving"**
   - Ensure user is authenticated
   - Check browser console for errors
   - Verify database permissions

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify all environment variables are set
3. Ensure database schema is properly applied
4. Check Supabase logs for database errors 