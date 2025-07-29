# Internal Linking SaaS MVP

A production-ready SaaS platform for managing internal linking projects. Users can create projects, add Google Doc articles as jobs, monitor real-time job processing status, and view anchor text diffs and metrics upon completion.

## Features

- 🔐 **Supabase Magic-link Authentication** - Secure, passwordless login
- 📊 **Real-time Job Status Updates** - Live updates via Supabase Realtime
- 📝 **Project Management** - Create and manage internal linking projects
- 🔗 **Google Docs Integration** - Process articles directly from Google Docs
- 📈 **HTML Diff Viewer** - Before/after comparison with syntax highlighting
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS
- 🌙 **Dark Mode Support** - System preference detection with manual toggle
- 📱 **Responsive Design** - Mobile-first approach with touch-friendly interactions
- ⚡ **Real-time Updates** - Instant job status changes and notifications

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Animation**: Framer Motion
- **State Management**: SWR for data fetching
- **Backend**: Supabase (Auth, Database, Realtime)
- **Forms**: React Hook Form with Zod validation
- **Diff Viewer**: react-diff-viewer-continued

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- Supabase account and project

### Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Set up your Supabase database with the following tables:

   **Projects Table:**
   ```sql
   create table projects (
     id uuid default gen_random_uuid() primary key,
     title text not null,
     site_url text not null,
     cornerstone_sheet text,
     user_id uuid references auth.users(id) on delete cascade not null,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null,
     updated_at timestamp with time zone default timezone('utc'::text, now()) not null
   );
   ```

   **Jobs Table:**
   ```sql
   create table jobs (
     id uuid default gen_random_uuid() primary key,
     project_id uuid references projects(id) on delete cascade not null,
     title text not null,
     article_doc text not null,
     status text check (status in ('queued', 'processing', 'done', 'error')) default 'queued',
     anchors_added integer default 0,
     before_html text,
     after_html text,
     error_message text,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null,
     updated_at timestamp with time zone default timezone('utc'::text, now()) not null
   );
   ```

4. Enable Row Level Security (RLS) and create policies:

   ```sql
   -- Enable RLS
   alter table projects enable row level security;
   alter table jobs enable row level security;

   -- Projects policies
   create policy "Users can view their own projects" on projects
     for select using (auth.uid() = user_id);

   create policy "Users can create their own projects" on projects
     for insert with check (auth.uid() = user_id);

   create policy "Users can update their own projects" on projects
     for update using (auth.uid() = user_id);

   create policy "Users can delete their own projects" on projects
     for delete using (auth.uid() = user_id);

   -- Jobs policies
   create policy "Users can view jobs for their projects" on jobs
     for select using (
       exists (
         select 1 from projects 
         where projects.id = jobs.project_id 
         and projects.user_id = auth.uid()
       )
     );

   create policy "Users can create jobs for their projects" on jobs
     for insert with check (
       exists (
         select 1 from projects 
         where projects.id = jobs.project_id 
         and projects.user_id = auth.uid()
       )
     );

   create policy "Users can update jobs for their projects" on jobs
     for update using (
       exists (
         select 1 from projects 
         where projects.id = jobs.project_id 
         and projects.user_id = auth.uid()
       )
     );
   ```

5. Start the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

6. Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── jobs/           # Job-related components
│   ├── layout/         # Layout components
│   ├── projects/       # Project-related components
│   └── ui/             # shadcn/ui components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── pages/              # Page components
└── main.tsx           # Application entry point
```

## Key Components

- **AuthGuard**: Handles authentication flow with magic-link login
- **ProjectModal**: Create new internal linking projects
- **JobsTable**: Real-time job status display with pagination
- **AddArticleDialog**: Add Google Docs articles for processing
- **JobDrawer**: Detailed job view with HTML diff comparison
- **ThemeToggle**: Light/dark mode switching

## Real-time Features

The application uses Supabase Realtime to provide live updates:

- Job status changes are reflected immediately
- New jobs appear in the table without refresh
- Processing progress updates in real-time
- Automatic reconnection handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details