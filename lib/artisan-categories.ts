export const ARTISAN_CATEGORY_PHOTOS: Record<string, string> = {
  "AC Technician": "/images/artisans/ac-technician.jpg",
  "Aluminum Fabricator": "/images/artisans/aluminum-fabricator.jpg",
  "Appliance Repair": "/images/artisans/appliance-repair.jpg",
  Barber: "/images/artisans/barber-shop.jpg",
  Blacksmith: "/images/artisans/blacksmith.jpg",
  Carpenter: "/images/artisans/carpenter-kweku.jpg",
  Cobbler: "/images/artisans/cobbler-shoemaker.jpg",
  Cleaner: "/images/artisans/cleaner-abena.jpg",
  Electrician: "/images/artisans/electrician-kwame.jpg",
  "Makeup Artist": "/images/artisans/makeup-artist.jpg",
  Mason: "/images/artisans/mason-adwoa.jpg",
  Mechanic: "/images/artisans/mechanic-yaw.jpg",
  Painter: "/images/artisans/painter-efua.jpg",
  Plasterer: "/images/artisans/mason-plastering.jpg",
  Plumber: "/images/artisans/plumber-kofi.jpg",
  Tailor: "/images/artisans/tailor-seamstress.jpg",
  Tiler: "/images/artisans/tiler-bathroom.jpg",
  Tutor: "/images/artisans/tutor-ama.jpg",
  Welder: "/images/artisans/welder-workshop.jpg",
  "Window Installer": "/images/artisans/window-installer.jpg",
}

export const ARTISAN_PROFILE_PHOTOS: Record<string, string> = {
  "Abena Mensah": "/images/artisans/cleaner-abena.jpg",
  "Adwoa Kumi": "/images/artisans/mason-adwoa.jpg",
  "Ama Owusu": "/images/artisans/tutor-ama.jpg",
  "Chukwudi Obi": "/images/artisans/electrician-kwame.jpg",
  "Efua Darko": "/images/artisans/painter-efua.jpg",
  "Esi Bonsu": "/images/artisans/tutor-esi.jpg",
  "Kofi Adu": "/images/artisans/plumber-kofi.jpg",
  "Kojo Mensah": "/images/artisans/mason-kojo.jpg",
  "Kwame Asante": "/images/artisans/electrician-kwame.jpg",
  "Kweku Boateng": "/images/artisans/carpenter-kweku.jpg",
  "Ngozi Eze": "/images/artisans/cleaner-ngozi.jpg",
  "Yaw Osei": "/images/artisans/mechanic-yaw.jpg",
}

export const ARTISAN_CATEGORIES = Object.keys(ARTISAN_CATEGORY_PHOTOS)

export function getArtisanPhoto(name: string, category: string) {
  return ARTISAN_PROFILE_PHOTOS[name] ?? ARTISAN_CATEGORY_PHOTOS[category] ?? null
}
