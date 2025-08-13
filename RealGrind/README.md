# 🚀 RealGrind - Your Competitive Programming Powerhouse

**Transform your coding journey from practice to podium finishes.**

RealGrind is a comprehensive competitive programming platform designed specifically for students and developers who want to excel in algorithmic problem-solving. Whether you're preparing for ICPC, chasing that Codeforces Expert rating, or just starting your competitive programming journey, RealGrind provides the tools, insights, and community to push you to the next level.

## ✨ What Makes RealGrind Special

### 🎯 **Smart Problem Recommendations**
Our intelligent recommendation engine analyzes your solving patterns, identifies weak areas, and suggests problems that perfectly match your skill level. No more random problem hunting – every problem you solve is strategically chosen to maximize your growth.

### 🏆 **Real-Time Progress Tracking**
Connect your Codeforces account and watch your journey unfold with beautiful visualizations. Track your rating progression, problem-solving streaks, and performance across different topics and difficulty levels.

### 🎓 **College Competition System**
Create and participate in college-specific contests. Compare your performance with peers from your institution and other colleges across India. Perfect for organizing internal competitions and tracking institutional progress.

### 📊 **Comprehensive Analytics**
- **Rating Progression Charts**: Visualize your Codeforces rating journey
- **Problem Distribution Analysis**: See your strengths across different topics
- **Submission Patterns**: Track your consistency and problem-solving frequency
- **Comparative Rankings**: See how you stack up against peers

### 🌐 **Dual Leaderboard System**
- **Global Rankings**: Compete with programmers worldwide
- **College Rankings**: See how your institution performs against others
- **Individual College Leaderboards**: Track your position within your college

### 🔗 **Seamless Codeforces Integration**
Automatic synchronization with Codeforces ensures your progress is always up-to-date. Our verification system prevents fake accounts while maintaining privacy and security.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes with TypeScript
- **Database**: PostgreSQL with Neon serverless
- **Authentication**: NextAuth.js with Google OAuth
- **UI Components**: shadcn/ui with Radix UI primitives
- **Charts & Visualizations**: Recharts
- **External APIs**: Codeforces API integration

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (we recommend Neon for serverless)
- Google OAuth credentials
- Codeforces account for testing

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/realgrind.git
   cd realgrind
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   \`\`\`env
   # Database
   DATABASE_URL="your-postgresql-connection-string"
   
   # NextAuth
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Google OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   \`\`\`

4. **Set up the database**
   Run the provided SQL scripts to create tables and seed initial data:
   \`\`\`bash
   # Run these scripts in your PostgreSQL database
   # scripts/001-create-tables.sql
   # scripts/004-create-colleges-table.sql
   # scripts/005-seed-sample-problems.sql
   # ... and other seed scripts
   \`\`\`

5. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Open your browser**
   Navigate to `http://localhost:3000` and start exploring!

## 🎯 How to Use RealGrind

### For Students
1. **Sign up** with your Google account
2. **Select your college** from our comprehensive database of Indian engineering institutions
3. **Verify your Codeforces handle** through our secure verification process
4. **Start solving** recommended problems tailored to your skill level
5. **Track your progress** with detailed analytics and visualizations
6. **Compete** in college contests and climb the leaderboards

### For Educators
1. **Create college contests** for your students
2. **Monitor student progress** through institutional dashboards
3. **Organize competitions** between different colleges
4. **Track institutional performance** on global leaderboards

## 🏗️ Project Structure

\`\`\`
realgrind/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── leaderboard/       # Ranking pages
│   ├── problems/          # Problem browser
│   └── contests/          # Contest management
├── components/            # Reusable UI components
├── lib/                   # Utility functions and configurations
├── scripts/               # Database scripts and seeders
└── types/                 # TypeScript type definitions
\`\`\`

## 🤝 Contributing

We welcome contributions from the competitive programming community! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and add tests if applicable
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Areas where we need help:
- Additional problem recommendation algorithms
- More comprehensive analytics and visualizations
- Mobile app development
- Integration with other competitive programming platforms
- Performance optimizations

## 📈 Roadmap

- [ ] **Mobile Application** - Native iOS and Android apps
- [ ] **AtCoder Integration** - Support for AtCoder contests and problems
- [ ] **Team Competitions** - Support for team-based contests
- [ ] **Mentorship System** - Connect beginners with experienced programmers
- [ ] **AI-Powered Code Review** - Automated feedback on solution quality
- [ ] **Virtual Contests** - Create custom contests with any problem set

## 🐛 Bug Reports & Feature Requests

Found a bug or have a feature idea? We'd love to hear from you!

- **Bug Reports**: Open an issue with detailed steps to reproduce
- **Feature Requests**: Open an issue with a clear description of the proposed feature
- **Questions**: Start a discussion in our GitHub Discussions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Codeforces** for providing the excellent API that powers our platform
- **The Competitive Programming Community** for inspiration and feedback
- **Indian Engineering Colleges** for fostering competitive programming culture
- **Open Source Contributors** who make projects like this possible

---

**Ready to turn practice into podium finishes?** 🏆

[Get Started Now](https://your-deployment-url.com) | [Join Our Community](https://github.com/yourusername/realgrind/discussions) | [Report Issues](https://github.com/yourusername/realgrind/issues)
