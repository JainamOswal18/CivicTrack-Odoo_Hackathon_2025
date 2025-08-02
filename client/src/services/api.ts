const API_BASE_URL = 'http://localhost:8000/api';

// API response types
export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: number;
    email: string;
    username: string;
  };
}

export interface RegisterResponse {
  message: string;
  token: string;
  user: {
    id: number;
    email: string;
    username: string;
  };
}

export interface ApiError {
  error: string;
  errors?: Array<{
    msg: string;
    param: string;
    value: string;
  }>;
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.error || 'An error occurred', data.errors);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error occurred');
  }
}

// Custom error class
class ApiError extends Error {
  public errors?: Array<{
    msg: string;
    param: string;
    value: string;
  }>;

  constructor(message: string, errors?: Array<{ msg: string; param: string; value: string }>) {
    super(message);
    this.name = 'ApiError';
    this.errors = errors;
  }
}

// Authentication API
export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    return apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(email: string, password: string, username: string): Promise<RegisterResponse> {
    return apiRequest<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    });
  },
};

// Issues API (for future use)
export const issuesApi = {
  async getNearbyIssues(lat: number, lng: number, radius: number = 3, category?: string, status?: string) {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radius.toString(),
    });
    
    if (category) params.append('category', category);
    if (status) params.append('status', status);

    return apiRequest(`/issues/nearby?${params}`);
  },

  async createIssue(formData: FormData) {
    const token = localStorage.getItem('authToken');
    
    return fetch(`${API_BASE_URL}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData, // Don't set Content-Type for FormData
    });
  },

  async flagIssue(issueId: number, reason?: string) {
    return apiRequest(`/issues/${issueId}/flag`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};

export { ApiError };