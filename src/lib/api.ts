const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  token?: string;
  user?: any;
  message?: string;
  count?: number;
}

export interface Category {
  id: string;
  slug: string;
  ar_name: string;
  en_name: string;
  works_count?: number;
}

export interface ClientLogo {
  id: string;
  logo_url: string;
  sort_order: number;
}

export interface Testimonial {
  id: string;
  ar_quote: string;
  en_quote: string;
  ar_name: string;
  en_name: string;
  ar_role: string;
  en_role: string;
  sort_order: number;
}

export interface AboutContent {
  ar_title: string;
  en_title: string;
  ar_text: string;
  en_text: string;
  image_url?: string | null;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async login(username: string, password: string): Promise<ApiResponse> {
    const response = await this.request('/auth.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'login',
        username,
        password,
      }),
    });

    if (response.success && response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async logout() {
    this.clearToken();
  }

  async getWorks(): Promise<ApiResponse> {
    return this.request('/works.php');
  }

  async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.request('/categories.php');
  }

  async getClients(): Promise<ApiResponse<ClientLogo[]>> {
    return this.request('/clients.php');
  }

  async createClient(imageFile: File): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('logo', imageFile);
    const response = await fetch(`${API_BASE}/clients.php`, {
      method: 'POST',
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      body: formData,
    });
    return response.json();
  }

  async moveClient(id: string, direction: 'up' | 'down'): Promise<ApiResponse> {
    return this.request(`/clients.php?id=${id}`, { method: 'PUT', body: JSON.stringify({ direction }) });
  }

  async deleteClient(id: string): Promise<ApiResponse> {
    return this.request(`/clients.php?id=${id}`, { method: 'DELETE' });
  }

  async getTestimonials(): Promise<ApiResponse<Testimonial[]>> {
    return this.request('/testimonials.php');
  }

  async createTestimonial(data: Omit<Testimonial, 'id' | 'sort_order'>): Promise<ApiResponse> {
    return this.request('/testimonials.php', { method: 'POST', body: JSON.stringify(data) });
  }

  async moveTestimonial(id: string, direction: 'up' | 'down'): Promise<ApiResponse> {
    return this.request(`/testimonials.php?id=${id}`, { method: 'PUT', body: JSON.stringify({ direction }) });
  }

  async deleteTestimonial(id: string): Promise<ApiResponse> {
    return this.request(`/testimonials.php?id=${id}`, { method: 'DELETE' });
  }

  async getAbout(): Promise<ApiResponse<AboutContent | null>> {
    return this.request('/about.php');
  }

  async saveAbout(data: AboutContent): Promise<ApiResponse> {
    return this.request('/about.php', { method: 'PUT', body: JSON.stringify(data) });
  }

  async uploadAboutImage(imageFile: File): Promise<ApiResponse<{ image_url: string }>> {
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await fetch(`${API_BASE}/about.php`, {
      method: 'POST',
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      body: formData,
    });
    return response.json();
  }

  async createCategory(data: Pick<Category, 'slug' | 'ar_name' | 'en_name'>): Promise<ApiResponse> {
    return this.request('/categories.php', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: Pick<Category, 'slug' | 'ar_name' | 'en_name'>): Promise<ApiResponse> {
    return this.request(`/categories.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string): Promise<ApiResponse> {
    return this.request(`/categories.php?id=${id}`, {
      method: 'DELETE',
    });
  }

  async getWork(id: string): Promise<ApiResponse> {
    return this.request(`/works.php?id=${id}`);
  }

  async createWork(data: any, imageFile?: File): Promise<ApiResponse> {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });

    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await fetch(`${API_BASE}/works.php`, {
      method: 'POST',
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      body: formData,
    });

    return response.json();
  }

  async createWorksBulk(categoryId: string, imageFiles: File[], onProgress?: (completed: number, total: number) => void): Promise<ApiResponse> {
    let created = 0;

    for (const file of imageFiles) {
      const title = file.name.replace(/\.[^/.]+$/, '') || 'Untitled work';
      const response = await this.createWork({
        ar_title: title,
        en_title: title,
        ar_type: 'Portfolio',
        en_type: 'Portfolio',
        tag: 'BULK',
        category_id: categoryId,
        class_name: 'work-orange',
      }, file);

      if (!response.success) return response;
      created += 1;
      onProgress?.(created, imageFiles.length);
    }

    return { success: true, message: 'Works created successfully', count: created };
  }

  async updateWork(id: string, data: any, imageFile?: File): Promise<ApiResponse> {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });

    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await fetch(`${API_BASE}/works.php?id=${id}`, {
      method: 'PUT',
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      body: formData,
    });

    return response.json();
  }

  async deleteWork(id: string): Promise<ApiResponse> {
    return this.request(`/works.php?id=${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
