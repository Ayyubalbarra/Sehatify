// apps/web/src/pages/Login.tsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import axios from 'axios'; 
import toast from 'react-hot-toast'; // Impor toast untuk notifikasi

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false); // Tambahkan loading state
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return; // Hentikan jika validasi gagal

    setIsLoading(true); // Mulai loading
    try {
      // Menggunakan process.env.VITE_APP_API_URL dari .env Vite
      const API_BASE_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000/api/v1';
      const response = await axios.post(
        `${API_BASE_URL}/auth/patient/login`, 
        {
          email: formData.email,
          password: formData.password,
        }
      );

      localStorage.setItem('authToken', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      toast.success(`Selamat datang, ${response.data.data.user.fullName || response.data.data.user.name || 'Pasien'}!`); // Notifikasi sukses
      navigate('/dashboard'); // Arahkan ke dashboard pasien

    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response?.data.message || 'Login gagal.'); // Tampilkan error dari server
      } else {
        console.error('Login failed:', err);
        toast.error('Terjadi kesalahan saat login.');
      }
    } finally {
      setIsLoading(false); // Akhiri loading
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="animate-fade-in">
          <div className="text-center mb-8">
            <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <LogIn className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-text mb-2">Welcome Back</h1>
            <p className="text-text-light">Sign in to your HealthCare Plus account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  errors.email 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-200 focus:border-primary focus:ring-primary/20'
                } focus:ring-2 outline-none`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pr-12 rounded-lg border transition-colors ${
                    errors.password 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-200 focus:border-primary focus:ring-primary/20'
                  } focus:ring-2 outline-none`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-light hover:text-primary"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-text-light">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="text-primary hover:text-primary-hover">
                  Forgot your password?
                </a>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}> {/* Tambahkan disabled */}
              {isLoading ? 'Signing In...' : 'Sign In'} {/* Ubah teks button saat loading */}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-text-light">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:text-primary-hover font-medium">
                Create one
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;