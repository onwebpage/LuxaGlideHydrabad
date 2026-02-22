import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

interface Ad {
  id: string;
  title: string;
  description: string | null;
  bannerImage: string;
  link: string;
  position: string;
  textColor: string | null;
  isActive: boolean;
  displayOrder: number;
}

interface AdBannerProps {
  position: "home_top" | "home_middle" | "home_bottom" | "products_top" | "products_sidebar" | "product_detail";
}

export function AdBanner({ position }: AdBannerProps) {
  const { data: ads = [] } = useQuery<Ad[]>({
    queryKey: [`/api/ads?position=${position}`],
    queryFn: async () => {
      const res = await fetch(`/api/ads?position=${position}`);
      if (!res.ok) return [];
      return res.json();
    }
  });

  if (!ads || ads.length === 0) return null;

  const isExternalLink = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.origin !== window.location.origin;
    } catch {
      return false;
    }
  };

  return (
    <div className="w-full space-y-4">
      {ads.map((ad) => {
        const isExternal = isExternalLink(ad.link);
        const AdContent = (
          <div className="relative overflow-hidden rounded-lg cursor-pointer group h-32 sm:h-40">
            <img 
              src={ad.bannerImage} 
              alt={ad.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {(ad.title || ad.description) && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <div style={{ color: ad.textColor || '#ffffff' }}>
                  {ad.title && <h3 className="font-bold text-lg">{ad.title}</h3>}
                  {ad.description && <p className="text-sm">{ad.description}</p>}
                </div>
              </div>
            )}
          </div>
        );

        return isExternal ? (
          <a key={ad.id} href={ad.link} target="_blank" rel="noopener noreferrer">
            {AdContent}
          </a>
        ) : (
          <Link key={ad.id} href={ad.link}>
            {AdContent}
          </Link>
        );
      })}
    </div>
  );
}
