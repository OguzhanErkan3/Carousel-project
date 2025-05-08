(function() {
  'use strict';

  $(document).ready(function init() {
    const $container = $('#product-container');
    if (!$container.length) return;

    // show loading state
    $container.html('<p>Ürünler yükleniyor...</p>');

    // localStorage helpers
    const getFavorites = () => JSON.parse(localStorage.getItem('favorites')) || [];
    const saveFavorites = (favs) => localStorage.setItem('favorites', JSON.stringify(favs));

    // toggle favorite
    function toggleFavorite(id) {
      const favs = getFavorites();
      const idx = favs.indexOf(id);
      if (idx === -1) favs.push(id);
      else favs.splice(idx, 1);
      saveFavorites(favs);
      return favs.includes(id);
    }

    // build carousel structure
    function buildCarousel() {
      $container.html(
        `<div class="carousel">
           <button class="carousel-btn prev-btn">&lt;</button>
           <div class="carousel-track"></div>
           <button class="carousel-btn next-btn">&gt;</button>
         </div>`
      );
    }

    // inject styles
    function injectStyles() {
      const css = `
.carousel {
  position: relative;
  overflow: hidden;
  padding: 16px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
}
.carousel-track {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding-bottom: 8px;
}
.carousel-track::-webkit-scrollbar { display: none; }
.product-card {
  flex: 0 0 calc(25% - 16px);
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  text-align: center;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.product-card img {
  width: 100%;
  aspect-ratio: 1/1;
  object-fit: cover;
  border-radius: 8px;
}
.product-card h3 { margin: 10px 0 5px; }
.product-card p { margin: 0; color: #28a745; font-weight: bold; }
.favorite-btn {
  position: static;
  display: inline-block;
  margin: 12px auto 0;
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #bbb;
  transition: transform 0.2s, color 0.2s;
}
.favorite-btn:hover {
  transform: scale(1.2);
  color: #e74c3c;
}
.favorite-btn.favorited {
  color: #e74c3c;
}
.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.5);
  border: none;
  color: #fff;
  font-size: 24px;
  padding: 8px;
  cursor: pointer;
  z-index: 1;
}
.prev-btn { left: 8px; }
.next-btn { right: 8px; }
@media (max-width: 768px) { .product-card { flex: 0 0 calc(50% - 16px); } }
@media (max-width: 480px) { .product-card { flex: 0 0 90%; } .carousel-btn { display: none; } }
      `;
      $('<style>').text(css).appendTo('head');
    }

    // fetch products
    async function fetchProducts() {
      try {
        const res = await fetch('products.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (e) {
        console.error('Fetch error:', e);
        return null;
      }
    }

    // render products
    function renderProducts(products) {
      const $track = $('.carousel-track');
      $track.empty();
      products.forEach(p => {
        const isFav = getFavorites().includes(p.id);
        const card = $(
          `<div class="product-card" data-id="${p.id}">
             <a href="${p.url}" target="_blank">
               <img src="${p.img}" alt="${p.name}" />
             </a>
             <h3>${p.name}</h3>
             <p>${p.price.toFixed(2)} TL</p>
             <button class="favorite-btn${isFav ? ' favorited' : ''}">${isFav ? '❤' : '♡'}</button>
           </div>`
        );
        $track.append(card);
      });
    }

    // scroll carousel
    function scrollCarousel(dir) {
      const $track = $('.carousel-track');
      const width = $('.product-card').outerWidth(true);
      $track.animate({ scrollLeft: $track.scrollLeft() + dir * width }, 300);
    }

    // setup events
    function setupEvents() {
      $container.on('click', '.favorite-btn', function() {
        const $btn = $(this);
        const id = $btn.closest('.product-card').data('id');
        const nowFav = toggleFavorite(id);
        $btn.toggleClass('favorited', nowFav).html(nowFav ? '❤' : '♡');
      });
      $container.on('click', '.prev-btn', () => scrollCarousel(-1));
      $container.on('click', '.next-btn', () => scrollCarousel(1));
    }

    // main
    (async function main() {
      injectStyles();
      buildCarousel();
      setupEvents();
      const products = await fetchProducts();
      if (!products) {
        $container.html('<p>Ürünler yüklenemedi.</p>');
        return;
      }
      renderProducts(products);
    })();
  });
})();
