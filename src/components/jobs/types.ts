export interface Job {
  id: string;
  title: string;
  company: string;
  logo?: string;
  location: string;
  union: string;
  salary: string;
  type: string; // 'full-time' | 'part-time' | 'contract' | 'internship'
  category: string;
  description: string;
  requirements: string[];
  experience: string;
  education: string;
  ageLimit?: string;
  benefits?: string[];
  phone: string;
  email?: string;
  deadline: string;
  postedDate: string;
  isFeatured: boolean;
  isUrgent: boolean;
  status: 'active' | 'pending' | 'rejected';
  views: number;
  createdByUid?: string;
  createdAt: string;
}

export interface CVProfile {
  name: string;
  phone: string;
  email: string;
  village: string;
  union: string;
  education: string;
  skills: string;
  experience: string;
  bio: string;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  cvDetails: CVProfile;
  status: 'applied' | 'reviewing' | 'accepted' | 'rejected';
  appliedAt: string;
}

export interface JobAlertSubscription {
  union: string;
  category: string;
  type: string;
  email: string;
  phone: string;
  createdAt: string;
}
