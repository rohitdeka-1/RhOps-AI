export type Department = 'engineering' | 'product' | 'design' | 'operations';

// High-resolution portraits from Pexels (free to use, no attribution required).
// 1600px wide @2x, auto-compressed, square-cropped.
export const pexels = (id: number, w = 1600) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${w}&fit=crop`;

const avatar1 = pexels(3763188);   // Jamie Lin
const avatar2 = pexels(2379005);   // Raj Patel
const avatar3 = pexels(1542085);   // Sora Tanaka
const avatar4 = pexels(2218786);   // Devon Park
const avatar5 = pexels(774909);    // Aisha Okonkwo
const avatar6 = pexels(733872);    // Carlos Méndez
const avatar7 = pexels(1222271);   // Marcus Webb
const avatar8 = pexels(1239291);   // Yuki Fernandez
const avatar9 = pexels(3760263);   // Lin Chen
const avatar10 = pexels(91227);    // Noah Williams
const avatarProfile = pexels(1181686); // Sarah Chen

export interface FunFacts {
  desk_snack?: string;
  hidden_talent?: string;
  karaoke_song?: string;
  dream_vacation?: string;
  [key: string]: string | undefined;
}

export interface Employee {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
  department: Department;
  email: string | null;
  phone: string | null;
  location: string | null;
  start_date: string;
  birthday: string | null;
  avatar_url: string | null;
  fun_facts: FunFacts;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  user_id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'member';
  avatar_url: string | null;
}

export interface Invitation {
  id: string;
  email: string;
  role: 'admin' | 'member';
  invited_by: string;
  status: 'pending' | 'accepted' | 'revoked';
  created_at: string;
}

export interface FeatureTab {
  id: string;
  label: string;
  description: string;
}

export interface LandingTestimonial {
  id: string;
  quote: string;
  author: string;
  title: string;
  company: string;
}

export interface FooterLinkGroup {
  product: { label: string; href: string }[];
  company: { label: string; href: string }[];
  legal: { label: string; href: string }[];
}

export const employees: Employee[] = [
  {
    id: 'emp-1',
    user_id: 'demo-user',
    full_name: 'Jamie Lin',
    role: 'Senior Engineer',
    department: 'engineering',
    email: 'jamie@acme.co',
    phone: '+1 415 555 0101',
    location: 'SF',
    start_date: '2021-06-14',
    birthday: '01-04',
    avatar_url: avatar1,
    fun_facts: {
      desk_snack: "Trader Joe's Everything Bagel Seasoning",
      hidden_talent: "Can solve a Rubik's cube in under 2 minutes",
      karaoke_song: "Don't Stop Believin'",
      dream_vacation: 'Japan during cherry blossom season',
    },
    created_at: '2021-06-14T09:00:00Z',
    updated_at: '2021-06-14T09:00:00Z',
  },
  {
    id: 'emp-2',
    user_id: 'demo-user',
    full_name: 'Raj Patel',
    role: 'Staff Engineer',
    department: 'engineering',
    email: 'raj@acme.co',
    phone: '+1 212 555 0134',
    location: 'NYC',
    start_date: '2021-08-02',
    birthday: '06-25',
    avatar_url: avatar2,
    fun_facts: {
      desk_snack: 'Cold brew, two sugars',
      hidden_talent: 'Brews competition-grade chai at home',
      karaoke_song: 'Bohemian Rhapsody (the full six minutes)',
      dream_vacation: 'Trek the Annapurna Circuit',
    },
    created_at: '2021-08-02T09:00:00Z',
    updated_at: '2021-08-02T09:00:00Z',
  },
  {
    id: 'emp-3',
    user_id: 'demo-user',
    full_name: 'Sora Tanaka',
    role: 'Engineer',
    department: 'engineering',
    email: 'sora@acme.co',
    phone: '+1 555 555 0178',
    location: 'Remote',
    start_date: '2023-03-15',
    birthday: '07-09',
    avatar_url: avatar3,
    fun_facts: {
      desk_snack: 'Onigiri from the corner konbini',
      hidden_talent: 'Competitive speedcuber, sub-15 average',
      karaoke_song: 'YOASOBI – Yoru ni Kakeru',
      dream_vacation: 'A month van-camping in New Zealand',
    },
    created_at: '2023-03-15T09:00:00Z',
    updated_at: '2023-03-15T09:00:00Z',
  },
  {
    id: 'emp-4',
    user_id: 'demo-user',
    full_name: 'Devon Park',
    role: 'Engineer',
    department: 'engineering',
    email: 'devon@acme.co',
    phone: '+1 512 555 0199',
    location: 'Austin',
    start_date: '2024-01-08',
    birthday: '11-30',
    avatar_url: avatar4,
    fun_facts: {
      desk_snack: 'Breakfast tacos, always',
      hidden_talent: 'Restores vintage film cameras',
      karaoke_song: 'Outkast – Hey Ya!',
      dream_vacation: 'Surf trip down the Baja peninsula',
    },
    created_at: '2024-01-08T09:00:00Z',
    updated_at: '2024-01-08T09:00:00Z',
  },
  {
    id: 'emp-5',
    user_id: 'demo-user',
    full_name: 'Aisha Okonkwo',
    role: 'Product Manager',
    department: 'product',
    email: 'aisha@acme.co',
    phone: '+1 555 555 0142',
    location: 'Remote',
    start_date: '2024-04-22',
    birthday: '02-02',
    avatar_url: avatar5,
    fun_facts: {
      desk_snack: 'Dark chocolate almonds',
      hidden_talent: 'Speaks three languages',
      karaoke_song: 'Lizzo – About Damn Time',
      dream_vacation: 'A slow train through Portugal',
    },
    created_at: '2024-04-22T09:00:00Z',
    updated_at: '2024-04-22T09:00:00Z',
  },
  {
    id: 'emp-6',
    user_id: 'demo-user',
    full_name: 'Carlos Méndez',
    role: 'Product Lead',
    department: 'product',
    email: 'carlos@acme.co',
    phone: '+1 415 555 0167',
    location: 'SF',
    start_date: '2022-11-01',
    birthday: '05-18',
    avatar_url: avatar6,
    fun_facts: {
      desk_snack: 'Plátanos fritos from the bodega',
      hidden_talent: 'Salsa dance instructor on weekends',
      karaoke_song: 'Bad Bunny – Tití Me Preguntó',
      dream_vacation: 'Two weeks lost in Oaxaca markets',
    },
    created_at: '2022-11-01T09:00:00Z',
    updated_at: '2022-11-01T09:00:00Z',
  },
  {
    id: 'emp-7',
    user_id: 'demo-user',
    full_name: 'Marcus Webb',
    role: 'Product Designer',
    department: 'design',
    email: 'marcus@acme.co',
    phone: '+1 415 555 0123',
    location: 'SF',
    start_date: '2024-05-06',
    birthday: '01-17',
    avatar_url: avatar7,
    fun_facts: {
      desk_snack: 'Almonds',
      hidden_talent: 'Amateur ceramicist',
      karaoke_song: 'Fleetwood Mac – Dreams',
      dream_vacation: 'A road trip through Patagonia',
    },
    created_at: '2024-05-06T09:00:00Z',
    updated_at: '2024-05-06T09:00:00Z',
  },
  {
    id: 'emp-8',
    user_id: 'demo-user',
    full_name: 'Yuki Fernandez',
    role: 'UX Designer',
    department: 'design',
    email: 'yuki@acme.co',
    phone: '+1 512 555 0145',
    location: 'Austin',
    start_date: '2022-07-18',
    birthday: '09-05',
    avatar_url: avatar8,
    fun_facts: {
      desk_snack: 'Spicy peanuts and seltzer',
      hidden_talent: 'Designs and prints her own zines',
      karaoke_song: 'Carly Rae Jepsen – Run Away With Me',
      dream_vacation: 'Cycling through the Dutch countryside',
    },
    created_at: '2022-07-18T09:00:00Z',
    updated_at: '2022-07-18T09:00:00Z',
  },
  {
    id: 'emp-9',
    user_id: 'demo-user',
    full_name: 'Lin Chen',
    role: 'Operations Lead',
    department: 'operations',
    email: 'lin@acme.co',
    phone: '+1 212 555 0156',
    location: 'NYC',
    start_date: '2024-03-11',
    birthday: '06-28',
    avatar_url: avatar9,
    fun_facts: {
      desk_snack: 'Pretzel sticks dunked in hummus',
      hidden_talent: 'Translates Tang dynasty poetry for fun',
      karaoke_song: 'Cyndi Lauper – Time After Time',
      dream_vacation: 'A slow trip down the Mekong',
    },
    created_at: '2024-03-11T09:00:00Z',
    updated_at: '2024-03-11T09:00:00Z',
  },
  {
    id: 'emp-10',
    user_id: 'demo-user',
    full_name: 'Noah Williams',
    role: 'Operations Coordinator',
    department: 'operations',
    email: 'noah@acme.co',
    phone: '+1 555 555 0188',
    location: 'Remote',
    start_date: '2021-12-20',
    birthday: '08-27',
    avatar_url: avatar10,
    fun_facts: {
      desk_snack: 'Kettle chips',
      hidden_talent: 'Builds custom mechanical keyboards',
      karaoke_song: 'Mr. Brightside',
      dream_vacation: 'Iceland in winter',
    },
    created_at: '2021-12-20T09:00:00Z',
    updated_at: '2021-12-20T09:00:00Z',
  },
];

export const profile: Profile = {
  id: 'demo-user',
  full_name: 'Sarah Chen',
  avatar_url: avatarProfile,
  created_at: '2021-06-01T09:00:00Z',
  updated_at: '2021-06-01T09:00:00Z',
};

export const teamMembers: TeamMember[] = [
  { user_id: 'demo-user', full_name: 'Sarah Chen', email: 'sarah@acme.co', role: 'admin', avatar_url: avatarProfile },
  { user_id: 'demo-user-2', full_name: 'Marcus Webb', email: 'marcus@acme.co', role: 'admin', avatar_url: avatar7 },
  { user_id: 'demo-user-3', full_name: 'Aisha Okonkwo', email: 'aisha@acme.co', role: 'member', avatar_url: avatar5 },
  { user_id: 'demo-user-4', full_name: 'Raj Patel', email: 'raj@acme.co', role: 'member', avatar_url: avatar2 },
];

export const invitations: Invitation[] = [
  {
    id: 'inv-1',
    email: 'priya@acme.co',
    role: 'member',
    invited_by: 'demo-user',
    status: 'pending',
    created_at: '2026-06-18T09:00:00Z',
  },
  {
    id: 'inv-2',
    email: 'tom@acme.co',
    role: 'admin',
    invited_by: 'demo-user',
    status: 'pending',
    created_at: '2026-06-20T15:30:00Z',
  },
  {
    id: 'inv-3',
    email: 'old-hire@acme.co',
    role: 'member',
    invited_by: 'demo-user',
    status: 'revoked',
    created_at: '2026-05-02T11:00:00Z',
  },
];

export const featureTabs: FeatureTab[] = [
  { id: 'employees', label: 'Clusters', description: 'Connect and monitor all your Kubernetes clusters in one place' },
  { id: 'profiles', label: 'Observability', description: 'Real-time metrics, log streaming, and graph visualizations' },
  { id: 'birthdays', label: 'AI Diagnostics', description: 'Instantly diagnose crashed pods with our RAG-powered Copilot' },
  { id: 'overview', label: 'Auto-remediation', description: 'Apply one-click fixes to your deployments safely and securely' },
];

export const testimonials: LandingTestimonial[] = [
  {
    id: 't1',
    quote: "We stopped running kubectl manually just to figure out why a pod crashed.",
    author: 'Maya R',
    title: 'DevOps Lead',
    company: 'Meridian',
  },
  {
    id: 't2',
    quote: "The AI Copilot is the feature that finally hooked our whole team on using a single dashboard.",
    author: 'Tom K',
    title: 'Platform Engineer',
    company: 'Stackform',
  },
  {
    id: 't3',
    quote: "Replaced our fragmented monitoring stack, and developers actually use this to self-serve.",
    author: 'Priya S',
    title: 'SRE',
    company: 'Loopcast',
  },
];

export const footerLinks: FooterLinkGroup = {
  product: [
    { label: 'Features', href: '#features' },
    { label: 'Demo', href: '/demo/overview' },
  ],
  company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
  ],
  legal: [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
  ],
};
