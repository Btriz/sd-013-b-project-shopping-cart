const CART_IDS = [];

// SALVA NO LOCAL STORAGE
function updateLocalStorage() {
  localStorage.clear();
  localStorage.setItem('CART_IDS', JSON.stringify(CART_IDS));
}

function saveToLocalStorage(itemId) {
  CART_IDS.push(itemId);
  updateLocalStorage();
}

// BUSCA PRODUTOS
function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}
function createProductItemElement({ id: sku, title: name, thumbnail: image }) {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));

  return section;
}

async function getProducts() {
  const query = 'search?q=computador';
  const baseURL = `https://api.mercadolibre.com/sites/MLB/${query}`;

  const response = await fetch(baseURL);
  const products = await response.json();
  return products.results;
}

function addItemsToScreen(products) {
  products.forEach((product) => {
    const item = createProductItemElement(product);
    const items = document.querySelector('.items');
    items.appendChild(item);
  });
}

// REMOVE DO CARRINHO
function cartItemClickListener(event) {
  const item = event.target;
  const parent = item.parentNode;
  const index = CART_IDS.indexOf(item.id);

  CART_IDS.splice(index, 1);
  parent.removeChild(item);
  updateLocalStorage();
}

// ADICIONA AO CARRINHO
function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

function createCartItemElement({ id: sku, title: name, price: salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.id = sku;
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

function addToCart(itemId) {
  const cart = document.querySelector('.cart__items');

  saveToLocalStorage(itemId);
  
  fetch(`https://api.mercadolibre.com/items/${itemId}`)
    .then((response) => response.json())
    .then((obj) => createCartItemElement(obj))
    .then((item) => {
    cart.appendChild(item);
  });
}

function buttonAddToCartListener() {
  const buttons = document.querySelectorAll('.item__add');

  buttons.forEach((button) => {
    button.addEventListener('click', (event) => {
      const itemId = getSkuFromProductItem(event.target.parentNode);
      
      addToCart(itemId);
    });
  });
}

// RECUPERA LOCAL STORAGE
function getLocalStorage() {
  const stringfiedArray = localStorage.getItem('CART_IDS');
  const arrayOfIds = JSON.parse(stringfiedArray);

  arrayOfIds.forEach((id) => {
    addToCart(id);
  });
}

window.onload = async () => {
  const products = await getProducts();
  addItemsToScreen(products);
  buttonAddToCartListener();
  getLocalStorage();
};
