const demoProducts = [
  {
    id: 1,
    name: "Garden vegetable box",
    category: "grocery",
    price: 520,
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 2,
    name: "Sweet oranges, 1 kg",
    category: "grocery",
    price: 220,
    image:
      "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 3,
    name: "Easy linen dress",
    category: "fashion",
    price: 2490,
    image:
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 4,
    name: "Everyday mini bag",
    category: "accessory",
    price: 1390,
    image:
      "https://images.unsplash.com/photo-1585488434455-7bbf0cd33c9e?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 5,
    name: "Classic gold hoop earrings",
    category: "accessory",
    price: 890,
    image:
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 6,
    name: "Natural face care set",
    category: "beauty",
    price: 1250,
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=700&q=80"
  }
];

let activeCategory = "all";
let searchTerm = "";
let toastTimer;

const productGrid = document.getElementById("productGrid");
const productTotal = document.getElementById("productTotal");
const cartCount = document.getElementById("cartCount");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartDrawer = document.getElementById("cartDrawer");
const drawerBackdrop = document.getElementById("drawerBackdrop");
const openCartButton = document.getElementById("openCart");
const adminPanel = document.getElementById("adminPanel");
const adminProductList = document.getElementById("adminProductList");
const toast = document.getElementById("toast");

function money(value) {
  return `৳${Number(value).toLocaleString()}`;
}

function getProducts() {
  const saved = localStorage.getItem("bazaraProducts");
  return saved ? JSON.parse(saved) : demoProducts;
}

function saveProducts(products) {
  localStorage.setItem("bazaraProducts", JSON.stringify(products));
}

function getCart() {
  const saved = localStorage.getItem("bazaraCart");
  return saved ? JSON.parse(saved) : [];
}

function saveCart(cart) {
  localStorage.setItem("bazaraCart", JSON.stringify(cart));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function renderProducts() {
  const products = getProducts().filter((product) => {
    const categoryMatches =
      activeCategory === "all" || product.category === activeCategory;

    const searchMatches = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return categoryMatches && searchMatches;
  });

  productTotal.textContent = `${products.length} products`;

  if (products.length === 0) {
    productGrid.innerHTML =
      '<p class="empty-state">No products found. Try another search or category.</p>';
    return;
  }

  productGrid.innerHTML = products
    .map(
      (product) => `
        <article class="product-card">
          <img src="${product.image}" alt="${product.name}" loading="lazy" />
          <small class="product-category">${product.category}</small>
          <h3>${product.name}</h3>
          <div class="product-bottom">
            <span>${money(product.price)}</span>
            <button class="add-button" onclick="addToCart(${product.id})">+</button>
          </div>
        </article>
      `
    )
    .join("");
}

function addToCart(productId) {
  const product = getProducts().find((item) => item.id === productId);

  if (!product) return;

  const cart = getCart();
  cart.push(product);
  saveCart(cart);

  renderCart();
  showToast(`${product.name} added to basket`);
}

function renderCart() {
  const cart = getCart();

  cartCount.textContent = cart.length;

  const total = cart.reduce((sum, item) => sum + Number(item.price), 0);
  cartTotal.textContent = money(total);

  if (cart.length === 0) {
    cartItems.innerHTML =
      '<p class="empty-state">Your basket is empty. Add something you love.</p>';
    return;
  }

  const groupedCart = cart.reduce((items, item) => {
    const existing = items.find((entry) => entry.product.id === item.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({ product: item, quantity: 1 });
    }
    return items;
  }, []);

  cartItems.innerHTML = groupedCart
    .map(({ product, quantity }) => `
        <div class="cart-row">
          <img src="${product.image}" alt="${product.name}" loading="lazy" />
          <div>
            <strong>${product.name}</strong>
            <span>${money(product.price * quantity)}</span>
            <div class="quantity-controls" aria-label="Quantity for ${product.name}">
              <button type="button" aria-label="Decrease ${product.name}" onclick="changeQuantity(${product.id}, -1)">−</button>
              <span>${quantity}</span>
              <button type="button" aria-label="Increase ${product.name}" onclick="changeQuantity(${product.id}, 1)">+</button>
            </div>
          </div>
          <button class="remove-button" onclick="removeProductFromCart(${product.id})">
            REMOVE
          </button>
        </div>
      `
    )
    .join("");
}

function changeQuantity(productId, change) {
  const cart = getCart();
  const itemIndex = cart.findIndex((item) => item.id === productId);

  if (change > 0) {
    const product = getProducts().find((item) => item.id === productId);
    if (product) cart.push(product);
  } else if (itemIndex !== -1) {
    cart.splice(itemIndex, 1);
  }

  saveCart(cart);
  renderCart();
}

function removeProductFromCart(productId) {
  const cart = getCart().filter((item) => item.id !== productId);
  saveCart(cart);
  renderCart();
}

function renderAdminProducts() {
  const products = getProducts();

  adminProductList.innerHTML = products
    .map(
      (product) => `
        <div class="admin-product">
          <img src="${product.image}" alt="${product.name}" />
          <div>
            <strong>${product.name}</strong>
            <small>${product.category} · ${money(product.price)}</small>
          </div>
          <button class="delete-button" onclick="deleteProduct(${product.id})">
            DELETE
          </button>
        </div>
      `
    )
    .join("");
}

function deleteProduct(productId) {
  const products = getProducts().filter((product) => product.id !== productId);
  saveProducts(products);
  renderProducts();
  renderAdminProducts();
  showToast("Product deleted");
}

document.querySelectorAll(".category").forEach((button) => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;

    document.querySelectorAll(".category").forEach((item) => {
      item.classList.remove("active");
    });

    button.classList.add("active");
    renderProducts();
  });
});

document.getElementById("searchInput").addEventListener("input", (event) => {
  searchTerm = event.target.value;
  renderProducts();
});

function setCartOpen(isOpen) {
  cartDrawer.classList.toggle("hidden", !isOpen);
  drawerBackdrop.classList.toggle("hidden", !isOpen);
  openCartButton.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("drawer-open", isOpen);
}

openCartButton.addEventListener("click", () => {
  setCartOpen(true);
});

document.getElementById("closeCart").addEventListener("click", () => {
  setCartOpen(false);
});

drawerBackdrop.addEventListener("click", () => setCartOpen(false));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setCartOpen(false);
    adminPanel.classList.add("hidden");
  }
});

document.getElementById("openAdmin").addEventListener("click", () => {
  adminPanel.classList.remove("hidden");
  renderAdminProducts();
});

document.getElementById("closeAdmin").addEventListener("click", () => {
  adminPanel.classList.add("hidden");
});

document.getElementById("productForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(event.target);
  const products = getProducts();

  const newProduct = {
    id: Date.now(),
    name: formData.get("name"),
    category: formData.get("category"),
    price: Number(formData.get("price")),
    image: formData.get("image")
  };

  products.push(newProduct);
  saveProducts(products);

  event.target.reset();
  renderProducts();
  renderAdminProducts();
  showToast("New product added");
});

document.getElementById("resetProducts").addEventListener("click", () => {
  localStorage.removeItem("bazaraProducts");
  renderProducts();
  renderAdminProducts();
  showToast("Demo products restored");
});

document.getElementById("checkoutButton").addEventListener("click", () => {
  showToast("Connect this button to Stripe, SSLCommerz or bKash payment API.");
});

renderProducts();
renderCart();