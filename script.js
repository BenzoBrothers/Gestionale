// Static lookup data for product codes
const codiceLookup = {
    "A001": { nome: "TEST", quantita: 1, categoria: "2", prezzo_unitario: 5.00 },
    "A002": { nome: "TEST 2", quantita: 4, categoria: "6", prezzo_unitario: 1.00 }
};

// Utility function to format currency
const formatCurrency = (value) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
};

// Function to load all products
const loadProducts = async () => {
    try {
        const response = await fetch('http://localhost:5000/prodotti');
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
    }
};

// Function to display products in the table
const displayProducts = (products) => {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.nome}</td>
            <td>${product.codice}</td>
            <td>${product.quantita}</td>
            <td>${product.categoria}</td>
            <td>${formatCurrency(product.prezzo_unitario)}</td>
            <td class="action-buttons">
                <button class="edit-btn" onclick="editProduct(${product.id})">Modifica</button>
                <button class="delete-btn" onclick="deleteProduct(${product.id})">Elimina</button>
            </td>
        `;
        productList.appendChild(row);
    });
};

// Function to handle form submission (create/update product)
// Function to handle code lookup and form autofill
const handleCodeLookup = async (code) => {
    // First try static lookup
    if (codiceLookup[code]) {
        const product = codiceLookup[code];
        document.getElementById('nome').value = product.nome;
        document.getElementById('quantita').value = product.quantita;
        document.getElementById('categoria').value = product.categoria;
        document.getElementById('prezzo_unitario').value = product.prezzo_unitario;
        return;
    }

    // If not found in static lookup, try dynamic lookup
    try {
        const response = await fetch(`http://localhost:5000/prodotti/codice/${code}`);
        if (response.ok) {
            const product = await response.json();
            document.getElementById('nome').value = product.nome;
            document.getElementById('quantita').value = product.quantita;
            document.getElementById('categoria').value = product.categoria;
            document.getElementById('prezzo_unitario').value = product.prezzo_unitario;
        } else {
            // If product not found, clear other fields
            document.getElementById('nome').value = '';
            document.getElementById('quantita').value = '';
            document.getElementById('categoria').value = '';
            document.getElementById('prezzo_unitario').value = '';
        }
    } catch (error) {
        console.error('Error during code lookup:', error);
    }
};

// Add blur event listener to code input
document.getElementById('codice').addEventListener('blur', (e) => {
    const code = e.target.value.trim();
    if (code) {
        handleCodeLookup(code);
    }
});

const productForm = document.getElementById('productForm');
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const productId = document.getElementById('productId').value;
    const productData = {
        nome: document.getElementById('nome').value,
        codice: document.getElementById('codice').value,
        quantita: parseInt(document.getElementById('quantita').value),
        categoria: document.getElementById('categoria').value,
        prezzo_unitario: parseFloat(document.getElementById('prezzo_unitario').value)
    };

    try {
        const url = productId ? 
            `http://localhost:5000/prodotti/${productId}` : 
            'http://localhost:5000/prodotti';
        
        const response = await fetch(url, {
            method: productId ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });

        if (response.ok) {
            productForm.reset();
            document.getElementById('productId').value = '';
            loadProducts();
        } else {
            console.error('Error saving product:', await response.text());
        }
    } catch (error) {
        console.error('Error saving product:', error);
    }
});

// Function to edit a product
const editProduct = async (id) => {
    try {
        const response = await fetch(`http://localhost:5000/prodotti/${id}`);
        const product = await response.json();

        document.getElementById('productId').value = product.id;
        document.getElementById('nome').value = product.nome;
        document.getElementById('codice').value = product.codice;
        document.getElementById('quantita').value = product.quantita;
        document.getElementById('categoria').value = product.categoria;
        document.getElementById('prezzo_unitario').value = product.prezzo_unitario;
    } catch (error) {
        console.error('Error loading product:', error);
    }
};

// Function to delete a product
const deleteProduct = async (id) => {
    if (!confirm('Sei sicuro di voler eliminare questo prodotto?')) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/prodotti/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadProducts();
        } else {
            console.error('Error deleting product:', await response.text());
        }
    } catch (error) {
        console.error('Error deleting product:', error);
    }
};

// Function to search products
const searchProducts = async () => {
    const nome = document.getElementById('searchNome').value;
    const categoria = document.getElementById('searchCategoria').value;

    try {
        const params = new URLSearchParams();
        if (nome) params.append('nome', nome);
        if (categoria) params.append('categoria', categoria);

        const response = await fetch(`http://localhost:5000/prodotti/search?${params}`);
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error searching products:', error);
    }
};

// Barcode scanner configuration and initialization
let html5QrcodeScanner = null;

const initializeScanner = () => {
    if (html5QrcodeScanner) {
        html5QrcodeScanner.clear();
    }

    const readerDiv = document.getElementById('reader');
    readerDiv.style.display = 'block';
    
    html5QrcodeScanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: {width: 250, height: 250} },
        false
    );

    html5QrcodeScanner.render((decodedText) => {
        // Success callback
        document.getElementById('codice').value = decodedText;
        handleCodeLookup(decodedText);
        
        // Stop scanning and hide reader
        html5QrcodeScanner.clear();
        readerDiv.style.display = 'none';
    }, (errorMessage) => {
        // Error callback
        console.log(errorMessage);
    });
};

// Handle scan button click
document.getElementById('scanButton').addEventListener('click', async () => {
    const scannerError = document.getElementById('scannerError');
    try {
        // Request camera permission
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
        
        scannerError.style.display = 'none';
        initializeScanner();
    } catch (error) {
        console.error('Camera access error:', error);
        scannerError.textContent = 'Errore: Impossibile accedere alla fotocamera. Verifica i permessi del browser.';
        scannerError.style.display = 'block';
    }
});

// Load products when the page loads
document.addEventListener('DOMContentLoaded', loadProducts);