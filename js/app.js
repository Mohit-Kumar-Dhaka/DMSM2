// --- State Management ---
let cart = JSON.parse(localStorage.getItem('gymCart')) || [];

function saveCart() {
  localStorage.setItem('gymCart', JSON.stringify(cart));
  updateCartBadge();
}

function showNotification(message) {
  const toast = document.createElement('div');
  toast.className = 'notification-toast';
  toast.innerHTML = `<span>✔️</span> <span>${message}</span>`;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// --- Cart Operations ---
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  
  saveCart();
  showNotification(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  if(window.location.pathname.includes('cart.html')) {
    renderCart();
  }
}

function updateQuantity(productId, delta) {
  const item = cart.find(item => item.id === productId);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      saveCart();
      if(window.location.pathname.includes('cart.html')) {
        renderCart();
      }
    }
  }
}

// --- UI Updates ---
function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (badge) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'flex' : 'none';
  }
}

// --- Render Products ---
function renderProducts(containerId, limit = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let displayProducts = products;
  if (limit) {
    displayProducts = products.slice(0, limit);
  }

  container.innerHTML = displayProducts.map(product => `
    <div class="product-card">
      <a href="product-detail.html?id=${product.id}">
        <img src="${product.image}" alt="${product.name}" class="product-img">
      </a>
      <div class="product-info">
        <a href="product-detail.html?id=${product.id}">
          <h3 class="product-title">${product.name}</h3>
        </a>
        <div class="product-price">$${product.price.toFixed(2)}</div>
        <p class="product-desc">${product.description}</p>
        <div style="display: flex; gap: 0.5rem; margin-top: auto;">
          <button class="btn-primary" style="flex: 1;" onclick="addToCart(${product.id})">Add to Cart</button>
          <a href="product-detail.html?id=${product.id}" class="btn-outline" style="padding: 0.8rem;">Details</a>
        </div>
      </div>
    </div>
  `).join('');
}

// --- Render Product Detail ---
function renderProductDetail() {
  const container = document.getElementById('product-detail-content');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get('id'));
  const product = products.find(p => p.id === productId);

  if (!product) {
    container.innerHTML = '<h2 class="text-center">Product not found</h2><div class="text-center mt-2"><a href="products.html" class="btn-primary">Back to Products</a></div>';
    return;
  }

  container.innerHTML = `
    <div class="product-detail-container">
      <div>
        <img src="${product.image}" alt="${product.name}" class="product-detail-img">
      </div>
      <div class="product-detail-info">
        <span class="text-muted" style="text-transform: uppercase; letter-spacing: 1px;">${product.category}</span>
        <h1>${product.name}</h1>
        <div class="product-detail-price">$${product.price.toFixed(2)}</div>
        <p class="product-detail-desc">${product.description} This premium product is built with the highest quality materials to ensure durability and performance. It is an essential addition to any serious fitness regimen.</p>
        <div style="display: flex; gap: 1rem; align-items: center;">
          <button class="btn-primary" style="font-size: 1.1rem; padding: 1rem 2rem;" onclick="addToCart(${product.id})">Add to Cart</button>
          <a href="cart.html" class="btn-outline" style="font-size: 1.1rem; padding: 1rem 2rem;">View Cart</a>
        </div>
      </div>
    </div>
  `;
}

// --- Render Cart Page ---
function renderCart() {
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartSubtotal = document.getElementById('cart-subtotal');
  const cartTotal = document.getElementById('cart-total');
  
  if (!cartItemsContainer) return;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="text-muted">Your cart is empty.</p>';
    cartSubtotal.textContent = '$0.00';
    cartTotal.textContent = '$0.00';
    return;
  }

  cartItemsContainer.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <div class="cart-item-title">${item.name}</div>
        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
        <span>${item.quantity}</span>
        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
      </div>
      <button class="remove-btn" onclick="removeFromCart(${item.id})"><i class="fas fa-trash"></i> ✖</button>
    </div>
  `).join('');

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
  cartTotal.textContent = `$${subtotal.toFixed(2)}`; // Ignoring tax/shipping for simplicity
}

// --- Checkout Operations ---
function selectPaymentMethod(method) {
  document.querySelectorAll('.payment-method').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.payment-form').forEach(el => el.classList.remove('active'));
  
  document.getElementById(`method-${method}`).classList.add('active');
  document.getElementById(`form-${method}`).classList.add('active');
}

function handleCheckout(event) {
  event.preventDefault();
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }
  alert("Payment successful! Thank you for your order.");
  cart = [];
  saveCart();
  window.location.href = 'index.html';
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();

  if (document.getElementById('featured-products')) {
    renderProducts('featured-products', 3);
  }
  
  if (document.getElementById('all-products')) {
    renderProducts('all-products');
  }

  if (document.getElementById('cart-items-container')) {
    renderCart();
  }

  if (document.getElementById('product-detail-content')) {
    renderProductDetail();
  }
  
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', handleCheckout);
  }
});
