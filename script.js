function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
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

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

// ----REQUISITO 4----

function saveLocalStorage() {
  const cart = document.querySelectorAll('.cart__item');
  const items = [];

  cart.forEach((item) => {
    items.push(item.innerText);
  });

  localStorage.clear();
  localStorage.setItem('cartItems', JSON.stringify(items));
}

// ----REQUISITO 3----
function cartItemClickListener(event) {
  const parent = event.target.parentNode;
  parent.removeChild(event.target);

  saveLocalStorage();
}
// ---------4-----------

function getLocalStorage() {
  const stringfiedArray = localStorage.getItem('cartItems');
  const arrayOfItems = JSON.parse(stringfiedArray);
  
  arrayOfItems.forEach((item) => {
    const cart = document.querySelector('.cart__items');
    const li = document.createElement('li');

    li.className = 'cart__item';
    li.innerText = item;
    li.addEventListener('click', cartItemClickListener);

    cart.appendChild(li);
  });
}

function createCartItemElement({ id: sku, title: name, price: salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

// ----REQUISITO 1----
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

// ----REQUISITO 2----
function fetchProduct(itemId) {
  return fetch(`https://api.mercadolibre.com/items/${itemId}`)
    .then((response) => response.json())
    .then((obj) => createCartItemElement(obj));
}

function addToCart(event) {
  const item = event.target.parentNode;
  const itemId = getSkuFromProductItem(item);

  fetchProduct(itemId)
  .then((obj) => {
    const cart = document.querySelector('.cart__items');

    cart.appendChild(obj);
    saveLocalStorage();
  });
}

function addToCartListener() {
const buttons = document.querySelectorAll('.item__add');

buttons.forEach((button) => {
button.addEventListener('click', addToCart);
});
}

window.onload = async () => {
  const products = await getProducts();
  addItemsToScreen(products);
  await addToCartListener();
  getLocalStorage();
};
