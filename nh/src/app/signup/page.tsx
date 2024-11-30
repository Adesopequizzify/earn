import { SignUp } from '@/components/SignUp'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up - WheatChain',
  description: 'Create your WheatChain account',
}

type SearchParams = { [key: string]: string | string[] | undefined }

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const referralCode = typeof searchParams.referral === 'string' ? searchParams.referral : undefined
  return <SignUp referralCode={referralCode} />
}

