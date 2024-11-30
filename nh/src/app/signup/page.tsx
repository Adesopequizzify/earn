import { SignUp } from '@/components/SignUp'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up - WheatChain',
  description: 'Create your WheatChain account',
}

export default function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  return (
    <SignUp
      referralCodePromise={searchParams.then(params => 
        typeof params.referral === 'string' ? params.referral : undefined
      )}
    />
  )
}

