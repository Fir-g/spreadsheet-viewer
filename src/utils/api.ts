// API utility to handle backend URL configuration
export const getBackendUrl = (): string => {
  const envUrl = import.meta.env.VITE_BACKEND_URL;

  // If we have an environment variable, use it
  if (envUrl) {
    // Ensure HTTPS in production (Amplify)
    if (window.location.protocol === "https:" && envUrl.startsWith("http:")) {
      return envUrl.replace("https:", "https:");
    }
    return envUrl;
  }

  // Fallback URL - use HTTPS in production
  const fallbackUrl =
    window.location.protocol === "https:"
      ? "https://52.66.225.78:8000"
      : "https://kubera-backend.thetailoredai.co";

  return fallbackUrl;
};

// Common headers for authenticated requests
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// Centralized authentication error handler
export const handleAuthError = (error: any, response?: Response) => {
  // Check for various authentication error patterns
  const errorMessage = error?.message || error?.detail || '';
  const isAuthError = 
    response?.status === 401 ||
    errorMessage.toLowerCase().includes('invalid credentials') ||
    errorMessage.toLowerCase().includes('invalid authentication credentials') ||
    errorMessage.toLowerCase().includes('authentication failed') ||
    errorMessage.toLowerCase().includes('unauthorized') ||
    errorMessage.toLowerCase().includes('token') && errorMessage.toLowerCase().includes('invalid');

  if (isAuthError) {
    // Clear token and redirect to auth
    localStorage.removeItem("token");
    window.location.href = "/auth";
    return true;
  }
  return false;
};

// API fetch wrapper with proper error handling
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const baseUrl = getBackendUrl();
  const url = `${baseUrl}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
      },
    });

    if (!response.ok) {
      // Try to get error details from response
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: `HTTP error! status: ${response.status}` };
      }

      // Handle authentication errors
      if (handleAuthError(errorData, response)) {
        throw new Error("Authentication failed");
      }
      
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    // Handle network errors or other issues
    if (handleAuthError(error)) {
      throw new Error("Authentication failed");
    }
    throw error;
  }
};

export const fetchCompaniesFundsAPI = async (projectId: string) => {
  const baseUrl = getBackendUrl();
  const token = localStorage.getItem("token");
  
  if (!token) {
    throw new Error("No authentication token found");
  }
  
  try {
    const response = await fetch(
      `${baseUrl}/metadata/get-extracted-data/${projectId}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (!response.ok) {
      // Try to get error details from response
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: `HTTP error! status: ${response.status}` };
      }

      // Handle authentication errors
      if (handleAuthError(errorData, response)) {
        throw new Error("Authentication failed");
      } else if (response.status === 404) {
        throw new Error("Project not found or no data available");
      } else {
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
    }
    
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error("Failed to fetch companies/funds:", error);
    // Handle authentication errors in catch block too
    if (handleAuthError(error)) {
      throw new Error("Authentication failed");
    }
    throw error; // Re-throw to let the component handle it
  }
};

export const fetchCompaniesFundsDetailedAPI = async (projectId: string, company: string, fund_name: string) => {
  const baseUrl = getBackendUrl();
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No authentication token found");
  }

  const body = JSON.stringify({
    company_name: company,
    fund_name: fund_name,
  });

  try {
    const response = await fetch(
      `${baseUrl}/metadata/extract-fields/${projectId}`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: body
      }
    );
    
    if (!response.ok) {
      // Try to get error details from response
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: `HTTP error! status: ${response.status}` };
      }

      // Handle authentication errors
      if (handleAuthError(errorData, response)) {
        throw new Error("Authentication failed");
      } else if (response.status === 404) {
        throw new Error("Project not found or no data available");
      } else {
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
    }
    
    const data = await response.json();
    
    // Validate the response structure
    if (!data || (typeof data.extracted_data !== 'object' && !Array.isArray(data.extracted_data))) {
      throw new Error("Invalid response format from server");
    }
    
    return data;
  } catch (error) {
    console.error("Failed to fetch detailed companies/funds data:", error);
    throw error; // Re-throw to let the component handle it
  }
};

export const fetchFundsDetailedAPI = async (projectId: string, fund_name: string) => {
  const baseUrl = getBackendUrl();
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No authentication token found");
  }

  const body = JSON.stringify({
    fund_name: fund_name,
  });

  try {
    const response = await fetch(
      `${baseUrl}/metadata/fund-detailed/${projectId}`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: body
      }
    );
    
    if (!response.ok) {
      // Try to get error details from response
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: `HTTP error! status: ${response.status}` };
      }

      // Handle authentication errors
      if (handleAuthError(errorData, response)) {
        throw new Error("Authentication failed");
      } else if (response.status === 404) {
        throw new Error("Project not found or no data available");
      } else {
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
    }
    
    const data = await response.json();
    
    // Validate the response structure
    if (!data || (typeof data.extracted_data !== 'object' && !Array.isArray(data.extracted_data))) {
      throw new Error("Invalid response format from server");
    }
    
    return data;
  } catch (error) {
    console.error("Failed to fetch detailed companies/funds data:", error);
    throw error; // Re-throw to let the component handle it
  }
};
