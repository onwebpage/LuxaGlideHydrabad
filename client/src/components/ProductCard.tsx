import styled from 'styled-components';
import { Product } from '@shared/schema';
import { Link } from 'wouter';
import { Heart, Eye, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
  const image = Array.isArray(images) && images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1445205170230-053b830c6050?q=80&w=800&auto=format&fit=crop';

  return (
    <Link href={`/products/${product.id}`}>
      <StyledWrapper>
        <div className="card group">
          {product.featured && (
            <div id="cardnewfilter">
              <p>HOT</p>
            </div>
          )}
          
          <div id="cardtop" className="relative overflow-hidden">
            <img 
              src={image} 
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1445205170230-053b830c6050?q=80&w=800&auto=format&fit=crop';
              }}
            />
            
            {/* Quick Actions Overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end pb-4 gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                className="w-[85%] bg-white/90 hover:bg-white text-black border-none rounded-full h-8 text-[10px] font-bold tracking-wider uppercase"
                onClick={(e) => {
                  e.preventDefault();
                  // Quick view logic would go here
                }}
              >
                <Eye className="w-3 h-3 mr-1" />
                Quick View
              </Button>
            </div>
            
            <button 
              className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-400 hover:text-red-500 transition-colors shadow-sm"
              onClick={(e) => {
                e.preventDefault();
                // Wishlist logic
              }}
            >
              <Heart className="w-3.5 h-3.5" />
            </button>
          </div>

          <div id="cardbottom" className="p-3 bg-white dark:bg-card">
            <p id="cardbottomtitle" className="font-bold text-gray-800 dark:text-gray-100 mb-1">{product.name}</p>
            <div className="flex items-center justify-between mt-auto">
              <p id="cardbottomprice" className="text-[#d4af37] font-bold text-sm">₹{parseFloat(product.price).toLocaleString()}</p>
              <div className="p-1.5 rounded-full bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <ShoppingCart className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
          
          <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/30 rounded-2xl transition-colors pointer-events-none" />
        </div>
      </StyledWrapper>
    </Link>
  );
}

const StyledWrapper = styled.div`
  cursor: pointer;
  width: 100%;
  
  .card {
    width: 100%;
    aspect-ratio: 3/4.5;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.05);
    overflow: hidden;
    position: relative;
    transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
    transform: none;
  }

  #cardtop {
    width: 100%;
    height: 72%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f8f8f8;
  }

  #cardbottom {
    width: 100%;
    height: 28%;
    display: flex;
    flex-direction: column;
  }

  #cardbottomtitle {
    font-size: 13px;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    height: 2.6em;
  }

  #cardnewfilter {
    width: 45px;
    height: 20px;
    background-color: #d4af37;
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 10;
    display: flex;
    color: white;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    font-weight: 800;
    font-size: 9px;
    letter-spacing: 0.05em;
    box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
  }

  .card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(212, 175, 55, 0.12);
  }

  .dark .card {
    background: #1a1a1a;
    border-color: rgba(255, 255, 255, 0.05);
  }
`;
