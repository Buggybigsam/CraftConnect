import CustomerNav from "@/components/navbar/CustomerNav"

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CustomerNav />
      {children}
    </>
  )
}
