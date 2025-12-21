// app/admin/products/new/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Plus, Trash2, AlertCircle, Loader2 } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface ProductVariant {
  length: string;
  color: string;
  price: string;
  stock: string;
  sku?: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showVariants, setShowVariants] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([
    { length: '14 inches', color: '#000000', price: '', stock: '', sku: '' }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    stock: '',
    featured: false,
    texture: '',
    hair_type: '',
    lengths: [] as string[],
    colors: [] as string[],
  });

  const [colorsInput, setColorsInput] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories');
        const data = await response.json();
        
        if (response.ok) {
          setCategories(data.categories || []);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };

    fetchCategories();
  }, []);

  // Length options
  const lengthOptions = [
    '8 inches', '10 inches', '12 inches', '14 inches', '16 inches', 
    '18 inches', '20 inches', '22 inches', '24 inches', '26 inches', '28 inches'
  ];

  // Hair type options
  const hairTypeOptions = [
    'Straight', 'Wavy', 'Curly', 'Coily', 'Kinky', 'Mixed'
  ];

  // Texture options
  const textureOptions = [
    'Silky', 'Soft', 'Medium', 'Coarse', 'Fine'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'price' || name === 'stock') {
      // Allow empty string for number inputs
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: File[] = [];
    const newPreviews: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (images.length + newImages.length >= 5) {
        alert('Maximum 5 images allowed');
        break;
      }

      // Validate image type
      if (!file.type.startsWith('image/')) {
        alert('Please upload image files only');
        continue;
      }

      // Validate image size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        continue;
      }

      newImages.push(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === newImages.length) {
          setImagePreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    }

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    setVariants(prev => [
      ...prev,
      { length: '14 inches', color: '#000000', price: '', stock: '', sku: '' }
    ]);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: string) => {
    setVariants(prev => {
      const newVariants = [...prev];
      newVariants[index] = { ...newVariants[index], [field]: value };
      return newVariants;
    });
  };

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.category_id) newErrors.category_id = 'Category is required';
    if (!formData.stock || parseInt(formData.stock) < 0) newErrors.stock = 'Valid stock quantity is required';
    if (images.length === 0) newErrors.images = 'At least one image is required';
    if (formData.lengths.length === 0) newErrors.lengths = 'At least one length is required';
    if (formData.colors.length === 0 && !showVariants) newErrors.colors = 'At least one color is required';

    // Validate variants if enabled
    if (showVariants) {
      variants.forEach((variant, index) => {
        if (!variant.length) newErrors[`variant_${index}_length`] = 'Length is required';
        if (!variant.color) newErrors[`variant_${index}_color`] = 'Color is required';
        if (!variant.price || parseFloat(variant.price) <= 0) newErrors[`variant_${index}_price`] = 'Valid price is required';
        if (!variant.stock || parseInt(variant.stock) < 0) newErrors[`variant_${index}_stock`] = 'Valid stock is required';
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setUploading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add basic fields
       Object.entries(formData).forEach(([key, value]) => {
        if (key === 'lengths' || key === 'colors') {
          formDataToSend.append(key, JSON.stringify(value));
        } else if (key === 'featured') {
          formDataToSend.append(key, value ? 'true' : 'false');
        } else if (key === 'price' || key === 'stock') {
          formDataToSend.append(key, String(value || '0'));
        } else {
          formDataToSend.append(key, String(value));
        }
      });

      // Add images
      images.forEach(image => {
        formDataToSend.append('images', image);
      });

      // Add variants if enabled
      if (showVariants && variants.length > 0) {
        const variantsToSend = variants.map(v => ({
          ...v,
          price: parseFloat(v.price) || 0,
          stock: parseInt(v.stock) || 0,
        }));
        formDataToSend.append('variants', JSON.stringify(variantsToSend));
      }

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create product');
      }

      setUploading(false);
      alert('Product created successfully!');
      router.push('/admin/products');
      router.refresh();

    } catch (err) {
      setUploading(false);
      setLoading(false);
      alert(err instanceof Error ? err.message : 'Failed to create product');
      console.error('Error creating product:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 mb-4 inline-flex items-center"
        >
          ← Back to Products
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-gray-600 mt-2">
          Fill in the details below to add a new product to your store.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-8">
        {/* Basic Information */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter product name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.category_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.category_id}
                </p>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₦) *
              </label>
              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                onFocus={(e) => {
                  if (formData.price === '0') {
                    e.target.value = '';
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === '') {
                    setFormData(prev => ({ ...prev, price: '0' }));
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.price}
                </p>
              )}
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stock"
                min="0"
                value={formData.stock}
                onChange={handleInputChange}
                onFocus={(e) => {
                  if (formData.stock === '0') {
                    e.target.value = '';
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === '') {
                    setFormData(prev => ({ ...prev, stock: '0' }));
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.stock ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.stock && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.stock}
                </p>
              )}
            </div>

            {/* Hair Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hair Type
              </label>
              <select
                name="hair_type"
                value={formData.hair_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select hair type</option>
                {hairTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Texture */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Texture
              </label>
              <select
                name="texture"
                value={formData.texture}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select texture</option>
                {textureOptions.map((texture) => (
                  <option key={texture} value={texture}>
                    {texture}
                  </option>
                ))}
              </select>
            </div>

            {/* Lengths - Mobile-friendly checkboxes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Lengths *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {lengthOptions.map((length) => (
                  <label
                    key={length}
                    className={`
                      flex items-center px-3 py-2 border rounded-lg cursor-pointer transition-colors
                      ${formData.lengths.includes(length)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-300 hover:border-gray-400'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={formData.lengths.includes(length)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            lengths: [...prev.lengths, length]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            lengths: prev.lengths.filter(l => l !== length)
                          }));
                        }
                      }}
                      className="sr-only"
                    />
                    <span className="text-sm">{length}</span>
                  </label>
                ))}
              </div>
              {errors.lengths && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.lengths}
                </p>
              )}
            </div>

            {/* Colors - Better input handling */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Colors *
                <span className="text-gray-500 text-xs ml-2">
                  {showVariants ? '(Configure in variants below)' : 'Separate colors with commas'}
                </span>
              </label>
              {showVariants ? (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                  <p className="text-sm text-gray-600">
                    Colors will be configured in the variants section below.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={colorsInput}
                    onChange={(e) => setColorsInput(e.target.value)}
                    onBlur={() => {
                      const colors = colorsInput.split(',')
                        .map(c => c.trim())
                        .filter(c => c.length > 0);
                      setFormData(prev => ({ ...prev, colors }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., Black, Brown, Blonde"
                  />
                  <div className="flex flex-wrap gap-2">
                    {formData.colors.map((color, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {color}
                        <button
                          type="button"
                          onClick={() => {
                            const newColors = [...formData.colors];
                            newColors.splice(index, 1);
                            setFormData(prev => ({ ...prev, colors: newColors }));
                          }}
                          className="ml-2 text-gray-500 hover:text-gray-700"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                  {errors.colors && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.colors}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Describe the product features, benefits, and details..."
            />
          </div>

          {/* Featured Product */}
          <div className="mt-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700">
                Mark as featured product
              </span>
            </label>
          </div>
        </div>

        {/* Images Upload */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Images *</h2>
          <div className="space-y-4">
            <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
              errors.images ? 'border-red-500' : 'border-gray-300'
            }`}>
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Upload up to 5 product images
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Supported formats: JPG, PNG, WebP. Max size: 5MB per image
              </p>
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <label
                htmlFor="image-upload"
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark cursor-pointer"
              >
                Select Images
              </label>
            </div>
            {errors.images && (
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.images}
              </p>
            )}

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="text-xs text-gray-500 mt-1 text-center truncate">
                      {images[index]?.name || `Image ${index + 1}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Variants Section */}
        <div className="border-b pb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Product Variants</h2>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showVariants}
                onChange={(e) => setShowVariants(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700">
                Enable product variants
              </span>
            </label>
          </div>

          {showVariants && (
            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">Variant {index + 1}</h3>
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Length *
                      </label>
                      <select
                        value={variant.length}
                        onChange={(e) => updateVariant(index, 'length', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        {lengthOptions.map((length) => (
                          <option key={length} value={length}>
                            {length}
                          </option>
                        ))}
                      </select>
                      {errors[`variant_${index}_length`] && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors[`variant_${index}_length`]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Color *
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={variant.color}
                          onChange={(e) => updateVariant(index, 'color', e.target.value)}
                          className="h-10 w-10 cursor-pointer rounded border border-gray-300"
                        />
                        <input
                          type="text"
                          value={variant.color}
                          onChange={(e) => updateVariant(index, 'color', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="#000000 or Black"
                        />
                      </div>
                      {errors[`variant_${index}_color`] && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors[`variant_${index}_color`]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (₦) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.price}
                        onChange={(e) => updateVariant(index, 'price', e.target.value)}
                        onFocus={(e) => {
                          if (variant.price === '0' || variant.price === '') {
                            e.target.value = '';
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === '') {
                            updateVariant(index, 'price', '0');
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="0.00"
                      />
                      {errors[`variant_${index}_price`] && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors[`variant_${index}_price`]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={variant.stock}
                        onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                        onFocus={(e) => {
                          if (variant.stock === '0' || variant.stock === '') {
                            e.target.value = '';
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === '') {
                            updateVariant(index, 'stock', '0');
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="0"
                      />
                      {errors[`variant_${index}_stock`] && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors[`variant_${index}_stock`]}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU (Optional)
                    </label>
                    <input
                      type="text"
                      value={variant.sku || ''}
                      onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Product SKU"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addVariant}
                className="inline-flex items-center px-4 py-2 text-primary hover:text-primary-dark"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Variant
              </button>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {uploading ? 'Uploading Images...' : 'Creating Product...'}
              </>
            ) : (
              'Create Product'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}