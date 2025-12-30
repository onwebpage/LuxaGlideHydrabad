import styled from 'styled-components';
import { Product } from '@shared/schema';
import { Link } from 'wouter';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
  const image = Array.isArray(images) && images.length > 0 ? images[0] : '/placeholder.jpg';

  return (
    <Link href={`/product/${product.id}`}>
      <StyledWrapper>
        <div className="card">
          {product.isNew && (
            <div id="cardnewfilter">
              <p>NEW</p>
            </div>
          )}
          <div id="cardbrightfilter" />
          <div id="cardtop">
            <img 
              src={image} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div id="cardbottom">
            <p id="cardbottomtitle">{product.name}</p>
            <p id="cardbottomprice">₹{parseFloat(product.price).toLocaleString()}</p>
          </div>
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
    aspect-ratio: 250 / 325;
    background: #fdfbf7;
    border-radius: 12px;
    box-shadow: -4px 4px 0px 2px rgba(212, 175, 55, 0.1);
    border: solid 1px #d4af3722;
    overflow: hidden;
    position: relative;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    transform: rotate(1deg) skewX(1deg);
  }

  #cardtop {
    width: 100%;
    height: 70%;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.1s ease;
    overflow: hidden;
  }

  #cardbottom {
    width: 100%;
    height: 30%;
    background-color: white;
    font-weight: 500;
    font-size: 16px;
    padding: 12px;
    color: #1a1a1a;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  #cardbottomtitle {
    margin-bottom: 4px;
    font-family: 'Playfair Display', serif;
    font-size: 14px;
    line-height: 1.2;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  #cardbottomprice {
    display: flex;
    justify-content: flex-end;
    margin-top: auto;
    border-top: 1px solid #d4af3733;
    padding-top: 4px;
    font-weight: 700;
    color: #d4af37;
    font-size: 15px;
  }

  #cardbrightfilter {
    width: 200%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.3);
    position: absolute;
    transform: rotate(-45deg) translateX(-100%) translateY(-100%);
    transition: all 0.6s ease;
    z-index: 1;
    pointer-events: none;
  }

  #cardnewfilter {
    width: 60px;
    height: 24px;
    background-color: #d4af37;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    display: flex;
    color: white;
    align-items: center;
    justify-content: center;
    border-bottom-right-radius: 12px;
    font-weight: 700;
    font-size: 10px;
    letter-spacing: 0.05em;
  }

  .card:hover {
    transform: translateY(-8px) rotate(0deg) skewX(0deg);
    box-shadow: 0px 12px 24px rgba(212, 175, 55, 0.15);
    border-color: #d4af3744;
  }

  .card:hover #cardbrightfilter {
    transform: rotate(-45deg) translateX(50%) translateY(50%);
  }

  .card:active #cardtop {
    transform: scale(1.02);
  }

  .card:active #cardbottom {
    background-color: #d4af37;
    color: white;
  }

  .card:active #cardbottomprice {
    border-top-color: rgba(255, 255, 255, 0.3);
    color: white;
  }
`;
