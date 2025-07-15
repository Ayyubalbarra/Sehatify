// apps/web/src/pages/Register.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../contexts/AuthContext'; // Impor useAuth

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    address: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { register, isLoading, isAuthenticated } = useAuth(); // Ambil register dan isLoading dari AuthContext

  // Redirect jika sudah login
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

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

    if (!formData.fullName.trim()) newErrors.fullName = 'Nama Lengkap harus diisi';
    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    if (!formData.password) {
      newErrors.password = 'Password harus diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password tidak cocok';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Nomor Telepon harus diisi';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Tanggal Lahir harus diisi';
    if (!formData.address.trim()) newErrors.address = 'Alamat harus diisi';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // Data yang dikirim ke backend
      const { confirmPassword, ...dataToSend } = formData; // Hapus confirmPassword
      await register(dataToSend);
      // Jika register berhasil, arahkan ke halaman login
      navigate('/login'); 
    } catch (err) {
      console.error('Registration failed:', err);
      // Error handling sudah di AuthContext, tapi bisa tambahkan logika UI di sini jika perlu
      setErrors(prev => ({ ...prev, email: 'Pendaftaran gagal. Email mungkin sudah terdaftar.' })); 
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="animate-fade-in">
          <div className="text-center mb-8">
            <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-text mb-2">Create New Account</h1>
            <p className="text-text-light">Join us to manage your health conveniently</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input fields */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-text mb-2">Full Name</label>
              <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} className={`w-full px-4 py-3 rounded-lg border ${errors.fullName ? 'border-red-500' : 'border-gray-200'}`} placeholder="Your full name" />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text mb-2">Email Address</label>
              <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-200'}`} placeholder="your@email.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} name="password" id="password" value={formData.password} onChange={handleChange} className={`w-full px-4 py-3 pr-12 rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-200'}`} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-light hover:text-primary">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-text mb-2">Confirm Password</label>
              <input type={showPassword ? 'text' : 'password'} name="confirmPassword" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={`w-full px-4 py-3 rounded-lg border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'}`} placeholder="Confirm your password" />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-text mb-2">Phone Number</label>
              <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className={`w-full px-4 py-3 rounded-lg border ${errors.phone ? 'border-red-500' : 'border-gray-200'}`} placeholder="+62 812-3456-7890" />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-text mb-2">Date of Birth</label>
              <input type="date" name="dateOfBirth" id="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className={`w-full px-4 py-3 rounded-lg border ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-200'}`} />
              {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-text mb-2">Address</label>
              <textarea name="address" id="address" value={formData.address} onChange={handleChange} rows={3} className={`w-full px-4 py-3 rounded-lg border ${errors.address ? 'border-red-500' : 'border-gray-200'}`} placeholder="Your full address"></textarea>
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
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