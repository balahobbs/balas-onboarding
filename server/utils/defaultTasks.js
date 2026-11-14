// The standard onboarding checklist. offset = days after the start date.
export const DEFAULT_TASKS = [
  { offset: 0, category: 'paperwork', priority: 'high', title: 'Sign your employment agreement', description: 'Review and e-sign the offer letter and employment agreement.' },
  { offset: 0, category: 'paperwork', priority: 'high', title: 'Submit ID and tax forms', description: 'Upload government ID, bank details and tax declaration forms.' },
  { offset: 0, category: 'it-setup', priority: 'high', title: 'Collect your laptop and set up accounts', description: 'Pick up equipment from IT and sign in to email, chat and the VPN.' },
  { offset: 1, category: 'meet-the-team', priority: 'medium', title: 'Have a 1:1 with your manager', description: 'Talk through your role, expectations and first-week plan.' },
  { offset: 3, category: 'compliance', priority: 'high', title: 'Complete security awareness training', description: 'Short course on passwords, phishing and data handling.' },
  { offset: 5, category: 'meet-the-team', priority: 'low', title: 'Meet your onboarding buddy', description: 'Coffee or lunch with the teammate assigned to help you settle in.' },
  { offset: 7, category: 'compliance', priority: 'medium', title: 'Read the employee handbook', description: 'Policies on leave, conduct, remote work and expenses.' },
  { offset: 7, category: 'growth', priority: 'medium', title: 'Agree on your 30-day goals', description: 'Write three goals with your manager and share them with HR.' },
  { offset: 14, category: 'training', priority: 'medium', title: 'Finish role-specific training', description: 'Complete the learning path for your team and tools.' },
  { offset: 30, category: 'check-in', priority: 'medium', title: '30-day check-in with HR', description: 'Share how onboarding is going and what could be better.' },
  { offset: 60, category: 'growth', priority: 'low', title: 'Share your first project update', description: 'Present progress to your team in the weekly meeting.' },
  { offset: 90, category: 'check-in', priority: 'high', title: '90-day review', description: 'Review goals, feedback and next steps with your manager.' },
];

export const CATEGORIES = ['paperwork', 'it-setup', 'training', 'meet-the-team', 'compliance', 'check-in', 'growth'];

export function buildTasksFor(user, createdBy) {
  const start = new Date(user.startDate);
  return DEFAULT_TASKS.map(({ offset, ...t }) => {
    const due = new Date(start);
    due.setDate(due.getDate() + offset);
    return { ...t, dueDate: due, assignee: user._id, createdBy };
  });
}
