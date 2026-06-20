import ArtisanNav from "@/components/navbar/ArtisanNav"

export default function ArtisanLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ArtisanNav />
      {children}
    </>
  )
}
