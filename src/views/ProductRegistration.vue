<template>
  <MainLayout pageTitle="Add New Product">
    <div class="product-form">
      <div class="form-group">
        <label>Product Name <span class="required">*</span></label>
        <input 
          type="text" 
          v-model="product.name" 
          placeholder="Enter product name" 
          :class="{ 'error': validationErrors.name }"
        />
        <span v-if="validationErrors.name" class="error-message">{{ validationErrors.name }}</span>
      </div>
      
      <div class="form-group">
        <label>Category <span class="required">*</span></label>
        <select 
          v-model="product.category"
          :class="{ 'error': validationErrors.category }"
        >
          <option value="">Select a category</option>
          <option>Electronics</option>
          <option>Clothing</option>
          <option>Home Goods</option>
          <option>Accessories</option>
        </select>
        <span v-if="validationErrors.category" class="error-message">{{ validationErrors.category }}</span>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Price ($) <span class="required">*</span></label>
          <input 
            type="number" 
            v-model="product.price" 
            placeholder="0.00" 
            step="0.01"
            :class="{ 'error': validationErrors.price }"
          />
          <span v-if="validationErrors.price" class="error-message">{{ validationErrors.price }}</span>
        </div>
        
        <div class="form-group">
          <label>Initial Stock <span class="required">*</span></label>
          <input 
            type="number" 
            v-model="product.stock" 
            placeholder="0" 
            :class="{ 'error': validationErrors.stock }"
          />
          <span v-if="validationErrors.stock" class="error-message">{{ validationErrors.stock }}</span>
        </div>
      </div>
      
      <div class="form-group">
        <label>Description</label>
        <textarea rows="4" v-model="product.description" placeholder="Enter product description"></textarea>
      </div>
      
      <div class="form-group">
        <label>Product Images <span class="required">*</span></label>
        <div 
          class="image-upload" 
          :class="{ 'has-image': product.image, 'error-border': validationErrors.image }"
        >
          <div v-if="product.image" class="image-preview">
            <img :src="product.image" alt="Product Image" />
            <button @click="removeImage" class="remove-image-btn">✕</button>
          </div>
          <div v-else class="upload-placeholder" @click="triggerFileInput">
            <span class="upload-icon">📷</span>
            <span>Drag & drop images here or</span>
            <button type="button">Browse Files</button>
            <input 
              type="file" 
              ref="fileInput" 
              accept="image/*" 
              class="file-input" 
              @change="handleImageUpload" 
            />
          </div>
        </div>
        <span v-if="validationErrors.image" class="error-message">{{ validationErrors.image }}</span>
      </div>
      
      <div class="form-group">
        <label>SKU (Stock Keeping Unit)</label>
        <input type="text" v-model="product.sku" placeholder="Enter SKU" />
        <small class="helper-text">If left empty, a default SKU will be generated.</small>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Weight (kg)</label>
          <input type="number" v-model="product.weight" placeholder="0.00" step="0.01" />
        </div>
        
        <div class="form-group">
          <label>Dimensions (cm)</label>
          <div class="dimension-inputs">
            <input type="number" v-model="product.dimensions.length" placeholder="L" />
            <input type="number" v-model="product.dimensions.width" placeholder="W" />
            <input type="number" v-model="product.dimensions.height" placeholder="H" />
          </div>
        </div>
      </div>
      
      <div class="form-actions">
        <button type="button" @click="$router.push('/inventory')" class="cancel-button">Cancel</button>
        <button type="button" @click="validateAndAddProduct" class="submit-button">
          Add Product
        </button>
      </div>
    </div>
  </MainLayout>
</template>

<script>
import { inject } from 'vue';
import MainLayout from '../components/MainLayout.vue'
import { products } from '../data/products'

export default {
  name: 'ProductRegistration',
  components: {
    MainLayout
  },
  setup() {
    const notifications = inject('notifications');
    return { notifications };
  },
  data() {
    return {
      product: {
        name: '',
        category: '',
        price: null,
        stock: null,
        description: '',
        image: null,
        sku: '',
        weight: null,
        dimensions: {
          length: null,
          width: null,
          height: null
        }
      },
      validationErrors: {}
    }
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    handleImageUpload(event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.product.image = e.target.result
          // Clear any previous image validation error
          if (this.validationErrors.image) {
            delete this.validationErrors.image;
          }
        }
        reader.readAsDataURL(file)
      }
    },
    removeImage() {
      this.product.image = null
      this.$refs.fileInput.value = ''
    },
    validateProduct() {
      this.validationErrors = {};
      let isValid = true;
      
      // Name validation
      if (!this.product.name.trim()) {
        this.validationErrors.name = 'Product name is required';
        isValid = false;
      }
      
      // Category validation
      if (!this.product.category) {
        this.validationErrors.category = 'Please select a category';
        isValid = false;
      }
      
      // Price validation
      if (!this.product.price || isNaN(this.product.price) || this.product.price <= 0) {
        this.validationErrors.price = 'Valid price is required';
        isValid = false;
      }
      
      // Stock validation
      if (this.product.stock === null || isNaN(this.product.stock) || this.product.stock < 0) {
        this.validationErrors.stock = 'Valid stock quantity is required';
        isValid = false;
      }
      
      // Image validation
      if (!this.product.image) {
        this.validationErrors.image = 'Product image is required';
        isValid = false;
      }
      
      return isValid;
    },
    validateAndAddProduct() {
      if (this.validateProduct()) {
        this.addProduct();
      } else {
        this.notifications.show('Please fix the form errors', 'error');
      }
    },
    addProduct() {
      // Generate new ID
      const newId = `P${String(products.length + 1).padStart(3, '0')}`;
      
      // Create new product object
      const newProduct = {
        id: newId,
        name: this.product.name.trim(),
        category: this.product.category,
        price: parseFloat(this.product.price),
        stock: parseInt(this.product.stock),
        image: this.product.image,
        description: this.product.description.trim(),
        sku: this.product.sku || `${this.product.category.substring(0, 4).toUpperCase()}-${newId}`,
        weight: parseFloat(this.product.weight) || 0,
        dimensions: {
          length: parseFloat(this.product.dimensions.length) || 0,
          width: parseFloat(this.product.dimensions.width) || 0,
          height: parseFloat(this.product.dimensions.height) || 0
        }
      };
      
      // Add to products array
      products.push(newProduct);
      
      // Show success notification
      this.notifications.show(`Product "${newProduct.name}" successfully added!`, 'success');
      
      // Reset form
      this.resetForm();
      
      // Navigate to inventory after short delay
      setTimeout(() => {
        this.$router.push('/inventory');
      }, 1500);
    },
    resetForm() {
      this.product = {
        name: '',
        category: '',
        price: null,
        stock: null,
        description: '',
        image: null,
        sku: '',
        weight: null,
        dimensions: {
          length: null,
          width: null,
          height: null
        }
      };
      this.validationErrors = {};
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    }
  }
}
</script>

<style scoped>
.product-form {
  max-width: 800px;
  margin: 0 auto;
  background: var(--card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
  position: relative;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-main);
  font-size: 0.95rem;
}

.required {
  color: var(--danger);
  margin-left: 2px;
}

input, select, textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  background-color: white;
  color: var(--text-main);
  transition: all 0.2s ease;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--primary-light);
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15);
}

input.error, select.error {
  border-color: var(--danger);
  background-color: rgba(240, 68, 56, 0.05);
}

.error-message {
  color: var(--danger);
  font-size: 0.8rem;
  margin-top: 0.3rem;
  display: block;
}

.helper-text {
  color: var(--text-muted);
  font-size: 0.8rem;
  margin-top: 0.3rem;
  display: block;
}

textarea {
  resize: vertical;
}

.dimension-inputs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.image-upload {
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-sm);
  padding: 2rem;
  text-align: center;
  min-height: 200px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease;
}

.image-upload:hover {
  border-color: var(--primary-light);
}

.image-upload.has-image {
  border-style: solid;
  padding: 0;
}

.image-upload.error-border {
  border-color: var(--danger);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--text-muted);
  cursor: pointer;
  width: 100%;
  height: 100%;
  justify-content: center;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.upload-placeholder button {
  margin-top: 1rem;
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.upload-placeholder button:hover {
  background: var(--primary-light);
}

.file-input {
  display: none;
}

.image-preview {
  width: 100%;
  height: 200px;
  position: relative;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: var(--radius-sm);
}

.remove-image-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.875rem;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.remove-image-btn:hover {
  opacity: 1;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-button {
  background: transparent;
  border: 1px solid var(--border-color);
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 500;
  color: var(--text-main);
  transition: all 0.2s ease;
}

.cancel-button:hover {
  background-color: #f1f5f9;
}

.submit-button {
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.submit-button:hover:not(:disabled) {
  background: var(--primary-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style> 