import React, { useEffect, useState } from 'react';
import { useCreateSchoolMutation, useUpdateSchoolMutation } from '../redux/schoolApi';
import { UPLOADS_BASE_URL } from '../redux/baseApi';
import Toast from './Toast';

const resolveLogoUrl = (logo) => {
  if (!logo) return '';
  if (/^https?:\/\//i.test(logo) || logo.startsWith('data:')) return logo;
  return `${UPLOADS_BASE_URL}${logo.startsWith('/') ? logo : `/${logo}`}`;
};

const DEFAULT_FORM = {
  name: '',
  logo:null,
  code: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  country: '',
  subscriptionPlan: 'standard',
  status: 'active'
};

const SchoolModal = ({ school, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [createSchool] = useCreateSchoolMutation();
  const [updateSchool] = useUpdateSchoolMutation();
  const [preview,setPreview]=useState('');


  useEffect(() => {
    if (school) {
      setFormData({
        ...DEFAULT_FORM,
        name: school.name || '',
        code: school.code || '',
        email: school.email || '',
        phone: school.phone || '',
        address: school.address || '',
        city: school.city || '',
        state: school.state || '',
        country: school.country || '',
        subscriptionPlan: school.subscriptionPlan || 'standard',
        status: school.status || 'active'
      });
      setPreview(school.logo ? resolveLogoUrl(school.logo) : '');
    } else {
      setFormData(DEFAULT_FORM);

      setPreview('');
    }
    setErrors({});
  }, [school]);



  const handleChange = (e) => {
  let { name, value,files} = e.target;

  if (name === 'logo') {
    const file = files?.[0];

    setFormData({
      ...formData,
      logo: file
    });

    if (file) {
      setPreview(URL.createObjectURL(file));
    }

    return;
  }

  if (name === "code") {
    value = value.toUpperCase(); // ✅ force uppercase
  }

  setFormData({ ...formData, [name]: value });
};

  const validate = () => {
    const nextErrors = {};
    if (!formData.name.trim()) nextErrors.name = 'School name is required';
    // Code (only uppercase letters + numbers, min 3)
  if (!formData.code.trim()) {
    nextErrors.code = 'School code is required';
  } else if (!/^[A-Z0-9]{3,10}$/.test(formData.code)) {
    nextErrors.code = 'Code must be 3-10 characters (A-Z, 0-9 only)';
  }
   // Email
  if (!formData.email.trim()) {
    nextErrors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    nextErrors.email = 'Invalid email format';
  }
    // Phone (ONLY 10 digits)
  if (!formData.phone.trim()) {
    nextErrors.phone = 'Phone number is required';
  } else if (!/^\d{10}$/.test(formData.phone)) {
    nextErrors.phone = 'Phone number must be exactly 10 digits';
  }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!validate()) return;

  //   try {
  //     if (school && school._id) {
  //       await updateSchool({ id: school._id, data: formData }).unwrap();
  //       setToast({ type: 'success', message: 'School updated successfully' });
  //     } else {
  //       await createSchool(formData).unwrap();
  //       setToast({ type: 'success', message: 'School created successfully' });
  //     }
  //     onSuccess?.();
  //     setTimeout(() => {
  //       onClose();
  //     }, 400);
  //   } catch (error) {
  //     setToast({ type: 'error', message: error.data?.message || 'Failed to save school' });
  //   }
  // };




  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validate()) return;

  try {
    const submitData = new FormData();

    // ✅ append normal fields only
    submitData.append('name', formData.name);
    submitData.append('code', formData.code);
    submitData.append('email', formData.email);
    submitData.append('phone', formData.phone);
    submitData.append('address', formData.address);
    submitData.append('city', formData.city);
    submitData.append('state', formData.state);
    submitData.append('country', formData.country);
    submitData.append('subscriptionPlan', formData.subscriptionPlan);
    submitData.append('status', formData.status);

    // ✅ append logo ONLY if selected
    if (formData.logo instanceof File) {
      submitData.append('logo', formData.logo);
    }

    if (school && school._id) {
      await updateSchool({
        id: school._id,
        data: submitData
      }).unwrap();

      setToast({
        type: 'success',
        message: 'School updated successfully'
      });
    } else {
      await createSchool(submitData).unwrap();

      setToast({
        type: 'success',
        message: 'School created successfully'
      });
    }

    onSuccess?.();

    setTimeout(() => {
      onClose();
    }, 400);

  } catch (error) {
    console.log(error);

    setToast({
      type: 'error',
      message: error.data?.message || 'Failed to save school'
    });
  }
};

  return (
    <div>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} duration={3000} />}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">School Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          </div>
          <div>
  <label className="block text-sm font-medium text-gray-700">
    School Logo
  </label>

  <input
    type="file"
    name="logo"
    accept="image/*"
    onChange={handleChange}
    className="mt-1 w-full rounded-lg border-gray-300 shadow-sm"
  />

  {preview && (
    <img
      src={preview}
      alt="Logo Preview"
      className="mt-3 h-20 w-20 rounded-full border object-cover"
    />
  )}
</div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Code</label>
            <input
              name="code"
              value={formData.code}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.code && <p className="text-sm text-red-600">{errors.code}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
               maxLength={10}
                inputMode="numeric"
                pattern="[0-9]*"
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Subscription Plan</label>
            <select
              name="subscriptionPlan"
              value={formData.subscriptionPlan}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="free">Free</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="City"
            className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <input
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="State"
            className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <input
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="Country"
            className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Save School
          </button>
        </div>
      </form>
    </div>
  );
};

export default SchoolModal;
