import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect landing route to the main dashboard
  redirect('/dashboard');
}
