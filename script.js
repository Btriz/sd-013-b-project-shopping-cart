let CART_IDS = [];

async function fetchById(id) {
  return fetch(`https://api.mercadolibre.com/items/${id}`)
    .then((response) => response.json());
}

// CARREGANDO 
function showLoading() {
  const loading = document.createElement('div');
  const body = document.querySelector('body');
  loading.className = 'loading';
  loading.innerText = 'CARREGANDO...';
  body.appendChild(loading);
}

function hideLoading() {
  const body = document.querySelector('body');
  const loading = document.querySelector('.loading');
  body.removeChild(loading);
}

// SALVA NO LOCAL STORAGE
async function updateLocalStorage() {
  await localStorage.clear();
  await localStorage.setItem('CART_IDS', JSON.stringify(CART_IDS));
  // updatePrices();
}

async function saveToLocalStorage(itemId) {
  await CART_IDS.push(itemId);
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

  await showLoading();
  const response = await fetch(baseURL);
  hideLoading();
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

// PREÇO
function updatePrice() {
  const currentPrice = document.querySelector('.total-price');
  let total = 0;

  document.querySelectorAll('.cart__item').forEach((item) => {
    const itemPrice = item.innerHTML.split('$')[1];
    total += parseFloat(itemPrice);
  });
  currentPrice.innerHTML = `${Math.round(total * 100) / 100}`;
}

// REMOVE DO CARRINHO
function cartItemClickListener(event) {
  const item = event.target;
  const parent = item.parentNode;
  const index = CART_IDS.indexOf(item.id);

  CART_IDS.splice(index, 1);
  parent.removeChild(item);
  updateLocalStorage();
  updatePrice();
}

function buttonEmptyCartListener() {
  const emptyCartButton = document.querySelector('.empty-cart');

  emptyCartButton.addEventListener('click', () => {
    const cart = document.querySelector('.cart__items');

    CART_IDS = [];
    cart.innerHTML = [];
    updateLocalStorage();
    updatePrice();
  });
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

async function addToCart(itemId) {
  const cart = document.querySelector('.cart__items');

  await saveToLocalStorage(itemId);
  
  showLoading();
  await fetchById(itemId)
    .then((obj) => createCartItemElement(obj))
    .then((item) => {
    cart.appendChild(item);
  });
  hideLoading();
  updatePrice();
}

function buttonAddToCartListener() {
  const addToCartButtons = document.querySelectorAll('.item__add');

  addToCartButtons.forEach((button) => {
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
  await getLocalStorage();
  buttonEmptyCartListener();
};
