import { SignUp } from '@/components/SignUp'

export default function SignUpPage({ searchParams }: { searchParams: { referral?: string } }) {
  return <SignUp referralCode={searchParams.referral} />
}

