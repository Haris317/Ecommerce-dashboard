<template>
  <MainLayout pageTitle="Inventory Management">
    <div class="inventory-controls">
      <div class="search-filter">
        <input type="text" v-model="searchQuery" placeholder="Search products..." />
        <select v-model="categoryFilter">
          <option value="">All Categories</option>
          <option>Electronics</option>
          <option>Clothing</option>
          <option>Home Goods</option>
          <option>Accessories</option>
        </select>
        <select v-model="statusFilter">
          <option value="">All Status</option>
          <option value="in-stock">In Stock</option>
          <option value="low-stock">Low Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
        <button @click="applyFilters" class="action-button">Filter</button>
      </div>
      <div class="actions">
        <router-link to="/products/new" class="action-button">Add New Product</router-link>
      </div>
    </div>

    <div class="inventory-table">
      <table>
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Current Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in filteredProducts" :key="product.id">
            <td data-label="ID">{{ product.id }}</td>
            <td data-label="Product">
              <div class="product-cell">
                <img v-if="product.image" :src="product.image" alt="Product image" class="product-thumbnail" />
                <img v-else src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23cccccc'/%3E%3C/svg%3E" alt="Product image" class="product-thumbnail" />
                {{ product.name }}
              </div>
            </td>
            <td data-label="Category">{{ product.category }}</td>
            <td data-label="Price">${{ product.price.toFixed(2) }}</td>
            <td data-label="Stock">{{ product.stock }}</td>
            <td data-label="Status">
              <span 
                class="status"
                :class="{
                  'in-stock': product.stock > 15,
                  'low-stock': product.stock > 0 && product.stock <= 15,
                  'out-of-stock': product.stock === 0
                }"
              >
                {{ getStockStatus(product.stock) }}
              </span>
            </td>
            <td data-label="Actions" class="actions">
              <button @click="editProduct(product)" class="edit-button">Edit</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="inventory-alerts">
      <h3>Low Stock Alerts</h3>
      <div class="alert-cards">
        <div v-for="product in lowStockProducts" :key="product.id" :class="['alert-card', { out: product.stock === 0 }]">
          <h4>{{ product.name }}</h4>
          <p>Current Stock: <strong>{{ product.stock }}</strong></p>
          <p>Recommended Stock: <strong>{{ getRecommendedStock(product) }}</strong></p>
          <button @click="orderMore(product)">Order More</button>
        </div>
      </div>
    </div>
    
    <div v-if="showOrderModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>Order More Stock</h3>
          <button @click="showOrderModal = false" class="close-button">✕</button>
        </div>
        <div class="modal-content">
          <p>Product: <strong>{{ selectedProduct?.name }}</strong></p>
          <p>Current Stock: <strong>{{ selectedProduct?.stock }}</strong></p>
          <div class="form-group">
            <label>Quantity to Order</label>
            <input type="number" v-model.number="orderQuantity" min="1" />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showOrderModal = false" class="cancel-button">Cancel</button>
          <button @click="confirmOrder" class="confirm-button">Place Order</button>
        </div>
      </div>
    </div>
    
    <div v-if="orderSuccess" class="order-success">
      <div class="success-content">
        <div class="success-icon">✓</div>
        <h3>Order Placed Successfully!</h3>
        <p>Your order for {{ orderQuantity }} units of {{ selectedProduct?.name }} has been placed.</p>
        <button @click="orderSuccess = false" class="close-success">Close</button>
      </div>
    </div>

    <!-- Edit Product Modal -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>Edit Product</h3>
          <button @click="showEditModal = false" class="close-button">✕</button>
        </div>
        <div class="modal-content">
          <div class="form-group">
            <label>Product Name</label>
            <input type="text" v-model="editForm.name" />
          </div>
          <div class="form-group">
            <label>Category</label>
            <select v-model="editForm.category">
              <option>Electronics</option>
              <option>Clothing</option>
              <option>Home Goods</option>
              <option>Accessories</option>
            </select>
          </div>
          <div class="form-group">
            <label>Price ($)</label>
            <input type="number" v-model.number="editForm.price" min="0" step="0.01" />
          </div>
          <div class="form-group">
            <label>Stock Quantity</label>
            <input type="number" v-model.number="editForm.stock" min="0" />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="editForm.description" rows="3"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showEditModal = false" class="cancel-button">Cancel</button>
          <button @click="saveProductChanges" class="confirm-button">Save Changes</button>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script>
import { inject } from 'vue';
import MainLayout from '../components/MainLayout.vue'
import { products } from '../data/products'

export default {
  name: 'InventoryManagement',
  components: {
    MainLayout
  },
  setup() {
    const notifications = inject('notifications');
    return { notifications };
  },
  data() {
    return {
      products,
      searchQuery: '',
      categoryFilter: '',
      statusFilter: '',
      editingProduct: null,
      editStockValue: 0,
      showOrderModal: false,
      selectedProduct: null,
      orderQuantity: 0,
      orderSuccess: false,
      showEditModal: false,
      editForm: {
        name: '',
        category: '',
        price: 0,
        stock: 0,
        description: ''
      }
    }
  },
  computed: {
    filteredProducts() {
      let result = [...this.products]
      
      // Apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        result = result.filter(product => 
          product.name.toLowerCase().includes(query) || 
          product.id.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
        )
      }
      
      // Apply category filter
      if (this.categoryFilter) {
        result = result.filter(product => product.category === this.categoryFilter)
      }
      
      // Apply status filter
      if (this.statusFilter) {
        switch (this.statusFilter) {
          case 'in-stock':
            result = result.filter(product => product.stock > 15)
            break
          case 'low-stock':
            result = result.filter(product => product.stock > 0 && product.stock <= 15)
            break
          case 'out-of-stock':
            result = result.filter(product => product.stock === 0)
            break
        }
      }
      
      return result
    },
    lowStockProducts() {
      return this.products.filter(product => product.stock <= 15)
        .sort((a, b) => a.stock - b.stock) // Sort by lowest stock first
        .slice(0, 3) // Show the 3 lowest stock products
    }
  },
  methods: {
    getStockStatus(stock) {
      if (stock === 0) return 'Out of Stock'
      if (stock <= 15) return 'Low Stock'
      return 'In Stock'
    },
    getRecommendedStock(product) {
      // This could be calculated based on various factors
      // For now, just a simple calculation
      return Math.max(25, product.stock * 3)
    },
    editProduct(product) {
      this.editingProduct = product;
      this.editForm = {
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        description: product.description
      };
      this.showEditModal = true;
    },
    saveProductChanges() {
      if (!this.editingProduct) return;
      
      const productIndex = this.products.findIndex(p => p.id === this.editingProduct.id);
      if (productIndex !== -1) {
        // Update product with form values
        this.products[productIndex] = {
          ...this.products[productIndex],
          name: this.editForm.name,
          category: this.editForm.category,
          price: this.editForm.price,
          stock: this.editForm.stock,
          description: this.editForm.description
        };
        
        // Show notification
        this.notifications.show(`Product "${this.editForm.name}" updated successfully`, 'success');
        
        // Close modal
        this.showEditModal = false;
        this.editingProduct = null;
      }
    },
    applyFilters() {
      // No need to do anything here as the filters are reactive
      // This method is just for the button click event
    },
    orderMore(product) {
      this.selectedProduct = product
      this.orderQuantity = this.getRecommendedStock(product) - product.stock
      this.showOrderModal = true
    },
    confirmOrder() {
      // Update product stock
      if (this.selectedProduct) {
        const productIndex = this.products.findIndex(p => p.id === this.selectedProduct.id);
        if (productIndex !== -1) {
          this.products[productIndex].stock += this.orderQuantity;
          
          // Show notification instead of full-screen success
          this.notifications.show(`Order placed: ${this.orderQuantity} units of ${this.selectedProduct.name}`, 'success');
          
          // Close modal
          this.showOrderModal = false;
          this.orderQuantity = 0;
        }
      }
    }
  }
}
</script>

<style scoped>
.inventory-controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.75rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.search-filter {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.search-filter input,
.search-filter select {
  padding: 0.7rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  font-size: 0.95rem;
  background-color: white;
  color: var(--text-main);
  transition: var(--transition-normal);
}

.search-filter input::placeholder {
  color: var(--text-muted);
}

.search-filter input:focus,
.search-filter select:focus {
  outline: none;
  border-color: var(--primary-light);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  transform: translateY(-2px);
}

.action-button {
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.7rem 1.25rem;
  border-radius: var(--radius-full);
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
  transition: var(--transition-normal);
}

.action-button:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.inventory-table {
  overflow-x: auto;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  margin-bottom: 2rem;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 700px; /* Ensure table doesn't get too narrow */
}

th {
  padding: 1rem;
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 600;
  border-bottom: 1px solid var(--border-color);
  background-color: rgba(248, 250, 252, 0.5);
}

td {
  padding: 1rem;
  font-size: 0.9rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-main);
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.product-thumbnail {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  object-fit: cover;
  border: 1px solid var(--border-color);
}

.status {
  padding: 0.4rem 0.85rem;
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-block;
}

.in-stock {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--success);
}

.low-stock {
  background-color: rgba(245, 158, 11, 0.1);
  color: var(--warning);
}

.out-of-stock {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--danger);
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.edit-button {
  padding: 0.5rem 0.85rem;
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  font-size: 0.8rem;
  transition: var(--transition-normal);
  font-weight: 500;
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--success);
  width: 100%;
}

.edit-button:hover {
  background-color: var(--success);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.inventory-alerts {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 1.75rem;
  border: 1px solid rgba(226, 232, 240, 0.6);
  transition: var(--transition-normal);
}

.inventory-alerts:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-3px);
}

.inventory-alerts h3 {
  font-size: 1.125rem;
  margin: 0 0 1.5rem 0;
  color: var(--text-main);
  font-weight: 600;
}

.alert-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.alert-card {
  background: white;
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-left: 4px solid var(--warning);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  transition: var(--transition-normal);
}

.alert-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.alert-card.out {
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-left: 4px solid var(--danger);
}

.alert-card h4 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.alert-card p {
  margin: 0.5rem 0;
  font-size: 0.875rem;
  color: var(--text-muted);
}

.alert-card strong {
  color: var(--text-main);
  font-weight: 600;
}

.alert-card button {
  margin-top: 1.25rem;
  background: var(--warning);
  color: white;
  border: none;
  padding: 0.6rem 1.25rem;
  border-radius: var(--radius-full);
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition-normal);
  font-size: 0.9rem;
}

.alert-card button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.alert-card.out button {
  background: var(--danger);
}

.alert-card.out button:hover {
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  width: 90%;
  max-width: 500px;
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--text-muted);
  transition: var(--transition-normal);
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  color: var(--text-main);
  background-color: rgba(0, 0, 0, 0.05);
}

.modal-content {
  padding: 1.5rem;
}

.modal-content p {
  margin: 0.5rem 0;
  font-size: 1rem;
}

.form-group {
  margin-top: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-muted);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  transition: var(--transition-normal);
  font-size: 1rem;
  color: var(--text-main);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-light);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.modal-footer {
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  border-top: 1px solid var(--border-color);
}

.cancel-button, .confirm-button {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-full);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-normal);
}

.cancel-button {
  background: none;
  border: 1px solid var(--border-color);
  color: var(--text-main);
}

.cancel-button:hover {
  background-color: rgba(248, 250, 252, 0.8);
  transform: translateY(-2px);
}

.confirm-button {
  background: var(--primary);
  color: white;
  border: none;
}

.confirm-button:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.order-success {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.success-content {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  padding: 2rem;
  text-align: center;
  width: 90%;
  max-width: 400px;
  box-shadow: var(--shadow-xl);
  animation: modalFadeIn 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.success-icon {
  width: 70px;
  height: 70px;
  border-radius: var(--radius-full);
  background: var(--success);
  color: white;
  font-size: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
}

.success-content h3 {
  margin: 0 0 1rem 0;
  color: var(--success);
  font-size: 1.5rem;
  font-weight: 600;
}

.success-content p {
  margin-bottom: 1.5rem;
  color: var(--text-muted);
  font-size: 1rem;
}

.close-success {
  background: var(--success);
  color: white;
  border: none;
  padding: 0.85rem 2rem;
  border-radius: var(--radius-full);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-normal);
  font-size: 1rem;
}

.close-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* Add responsive styles for the inventory management page */
@media (max-width: 1024px) {
  .alert-cards {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
  
  .product-cell {
    gap: 0.5rem;
  }
}

@media (max-width: 768px) {
  .inventory-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-filter, .actions {
    width: 100%;
  }
  
  .search-filter {
    grid-template-columns: 1fr 1fr;
    display: grid;
    gap: 0.75rem;
  }
  
  .search-filter input {
    grid-column: span 2;
  }
  
  .product-thumbnail {
    width: 40px;
    height: 40px;
  }
  
  .inventory-table {
    padding: 1rem;
    overflow-x: auto;
  }
  
  table {
    min-width: 650px;
  }
}

@media (max-width: 576px) {
  .search-filter {
    grid-template-columns: 1fr;
  }
  
  .search-filter input {
    grid-column: span 1;
  }
  
  .alert-cards {
    grid-template-columns: 1fr;
  }
  
  .modal {
    width: 95%;
    max-width: none;
  }
}

@media (max-width: 480px) {
  .filters {
    flex-direction: column;
  }
  
  .filter {
    width: 100%;
  }
  
  .alert-cards {
    grid-template-columns: 1fr;
  }
  
  /* Mobile table view transformation */
  .inventory-table {
    margin: 0 -0.75rem 1.5rem; /* Extend beyond container padding */
    width: calc(100% + 1.5rem);
    background: transparent;
    box-shadow: none;
  }
  
  table {
    min-width: auto;
    width: 100%;
    display: block;
  }
  
  thead {
    display: none;
  }
  
  tbody {
    display: block;
  }
  
  tr {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
    background: white;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    padding: 1rem;
  }
  
  td {
    display: flex;
    padding: 0.5rem 0;
    border-bottom: none;
    align-items: center;
  }
  
  td::before {
    content: attr(data-label);
    font-weight: 600;
    width: 30%;
    margin-right: 0.5rem;
  }
  
  td.actions {
    margin-top: 0.5rem;
    justify-content: flex-end;
  }
  
  .edit-button {
    width: 100%;
  }
  
  .product-cell {
    width: 100%;
  }
}
</style> 