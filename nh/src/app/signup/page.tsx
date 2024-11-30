import { SignUp } from '@/components/SignUp'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up - WheatChain',
  description: 'Create your WheatChain account',
}

interface PageProps {
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}

export default function SignUpPage({ searchParams }: PageProps) {
  const referralCode = typeof searchParams.referral === 'string' ? searchParams.referral : undefined
  return <SignUp referralCode={referralCode} />
}

