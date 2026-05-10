export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid-bg flex items-center justify-center">
      <div className="relative z-10">{children}</div>
    </div>
  )
}
