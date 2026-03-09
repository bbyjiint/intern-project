import { redirect } from 'next/navigation'

export default function CreateJobPostPage() {
  redirect('/employer/job-post?create=1')
}
