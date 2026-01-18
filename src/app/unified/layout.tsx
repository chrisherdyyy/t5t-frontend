import { DashboardLayout } from '@/components/DashboardLayout'

export default function UnifiedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}
