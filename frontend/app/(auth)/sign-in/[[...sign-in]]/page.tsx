import { SignIn } from '@clerk/nextjs'
export default function Page() {
  return <SignIn appearance={{ variables: { colorPrimary: '#00f5ff', colorBackground: '#0f0f1a', colorText: '#e2e8f0', colorInputBackground: '#13131f', colorInputText: '#e2e8f0' } }} />
}
