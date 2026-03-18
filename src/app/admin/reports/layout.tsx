// src/app/admin/reports/layout.tsx
export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="py-6">
        {children}
      </div>
    </div>
  )
}