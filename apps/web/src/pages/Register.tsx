import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import axios from 'axios'; // <-- 1. Impor axios

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    address: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) { // Sesuaikan dengan validasi backend (min 6)
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- PERBAIKAN DI SINI ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // 2. Kirim data ke API registrasi pasien
        const response = await axios.post(
          'http://localhost:5000/api/v1/patient/register',
          {
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            dateOfBirth: formData.dateOfBirth,
            address: formData.address,
          }
        );
        
        console.log(response.data.message); // "Pendaftaran berhasil"
        
        // 3. Arahkan ke halaman login setelah berhasil
        navigate('/login');

      } catch (err: any) {
        // 4. Tangani error dari server (misal: email sudah ada)
        if (axios.isAxiosError(err) && err.response) {
            // Jika error spesifik untuk satu field (misal: email)
            if (err.response.data.message.toLowerCase().includes('email')) {
                 setErrors(prev => ({ ...prev, email: err.response?.data.message }));
            } else {
                // Tampilkan error umum jika tidak spesifik
                setErrors(prev => ({ ...prev, form: err.response?.data.message || 'Terjadi kesalahan' }));
            }
        } else {
            console.error('Registration failed:', err);
            setErrors(prev => ({ ...prev, form: 'Terjadi kesalahan pada server.' }));
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="animate-fade-in">
          <div className="text-center mb-8">
            <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-text mb-2">Create Account</h1>
            <p className="text-text-light">Join HealthCare Plus to manage your health better</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    errors.fullName 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-200 focus:border-primary focus:ring-primary/20'
                  } focus:ring-2 outline-none`}
                  placeholder="Enter your full name"
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
                )}
              </div>

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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    placeholder="Create a password"
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

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pr-12 rounded-lg border transition-colors ${
                      errors.confirmPassword 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-primary focus:ring-primary/20'
                    } focus:ring-2 outline-none`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-light hover:text-primary"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    errors.phone 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-200 focus:border-primary focus:ring-primary/20'
                  } focus:ring-2 outline-none`}
                  placeholder="Enter your phone number"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    errors.dateOfBirth 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-200 focus:border-primary focus:ring-primary/20'
                  } focus:ring-2 outline-none`}
                />
                {errors.dateOfBirth && (
                  <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className={`w-full px-4 py-3 rounded-lg border transition-colors resize-none ${
                  errors.address 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-200 focus:border-primary focus:ring-primary/20'
                } focus:ring-2 outline-none`}
                placeholder="Enter your address"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-500">{errors.address}</p>
              )}
            </div>

            {errors.form && (
                <p className="mt-1 text-sm text-red-500 text-center">{errors.form}</p>
            )}

            <Button type="submit" size="lg" className="w-full">
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-text-light">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-primary-hover font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;