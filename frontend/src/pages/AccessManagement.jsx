import React, { useState, useEffect } from 'react';
import { useGetAllPermissionsQuery, useUpdatePermissionsMutation } from '../redux/permissionsApi';
import Toast from '../components/Toast';
import { FaShieldAlt, FaUserTie, FaUserGraduate, FaCheck, FaTimes, FaSearch, FaRedo, FaLockOpen, FaLock } from 'react-icons/fa';

const teacherModules = [
  { id: 'dashboard', name: 'Dashboard', icon: '📊' },
  { id: 'attendance', name: 'Attendance', icon: '📋' },
  { id: 'assignments', name: 'Assignments', icon: '📝' },
  { id: 'timetable', name: 'Timetable', icon: '📅' },
  { id: 'fees', name: 'Fees', icon: '💰' },
  { id: 'exams', name: 'Exams', icon: '📚' },
  { id: 'live-classes', name: 'Live Classes', icon: '📹' },
  { id: 'analytics', name: 'Analytics', icon: '📈' },
  { id: 'doubts', name: 'Doubts', icon: '❓' }
];

const studentModules = [
  { id: 'dashboard', name: 'Dashboard', icon: '📊' },
  { id: 'attendance', name: 'Attendance', icon: '📋' },
  { id: 'assignments', name: 'Assignments', icon: '📝' },
  { id: 'fees', name: 'Fees', icon: '💰' },
  { id: 'timetable', name: 'Timetable', icon: '📅' },
  { id: 'performance', name: 'Performance', icon: '🏆' },
  { id: 'live-classes', name: 'Live Classes', icon: '📹' },
  { id: 'doubts', name: 'Doubts', icon: '❓' }
];

function AccessManagement() {
  const { data: permissionsData, isLoading, error, refetch } = useGetAllPermissionsQuery();
  const [updatePermissions] = useUpdatePermissionsMutation();
  const [toast, setToast] = useState({ type: '', message: '', show: false });
  const [teacherPermissions, setTeacherPermissions] = useState([]);
  const [studentPermissions, setStudentPermissions] = useState([]);
  const [activeTab, setActiveTab] = useState('teacher');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (permissionsData) {
      const teacherData = permissionsData.find(p => p.role === 'teacher');
      const studentData = permissionsData.find(p => p.role === 'student');
      if (teacherData) setTeacherPermissions(teacherData.permissions);
      if (studentData) setStudentPermissions(studentData.permissions);
    }
  }, [permissionsData]);

  const handleUpdatePermissions = async (role) => {
    try {
      setIsSaving(true);
      let permArray = role === 'teacher' ? teacherPermissions : studentPermissions;
      await updatePermissions({ role, permissions: permArray }).unwrap();
      const roleName = role === 'teacher' ? 'Teachers' : 'Students';
      setToast({ type: 'success', message: `Permissions updated successfully for ${roleName}!`, show: true });
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to update permissions', show: true });
    } finally {
      setIsSaving(false);
    }
  };

  const togglePermission = (role, moduleId) => {
    if (role === 'teacher') {
      if (teacherPermissions.includes(moduleId)) {
        setTeacherPermissions(teacherPermissions.filter(p => p !== moduleId));
      } else {
        setTeacherPermissions([...teacherPermissions, moduleId]);
      }
    } else if (role === 'student') {
      if (studentPermissions.includes(moduleId)) {
        setStudentPermissions(studentPermissions.filter(p => p !== moduleId));
      } else {
        setStudentPermissions([...studentPermissions, moduleId]);
      }
    }
  };

  const enableAll = (role) => {
    const modules = role === 'teacher' ? teacherModules : studentModules;
    const allPerms = modules.map(m => m.id);
    if (role === 'teacher') {
      setTeacherPermissions(allPerms);
    } else {
      setStudentPermissions(allPerms);
    }
  };

  const disableAll = (role) => {
    if (role === 'teacher') {
      setTeacherPermissions([]);
    } else {
      setStudentPermissions([]);
    }
  };

  const resetDefaults = (role) => {
    let defaultPerms = [];
    if (role === 'teacher') {
      defaultPerms = ['dashboard', 'attendance', 'assignments', 'timetable', 'exams', 'live-classes', 'doubts', 'analytics'];
      setTeacherPermissions(defaultPerms);
    } else {
      defaultPerms = ['dashboard', 'attendance', 'assignments', 'fees', 'live-classes', 'performance', 'timetable'];
      setStudentPermissions(defaultPerms);
    }
  };

  const filteredModules = (modules) => {
    return modules.filter(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-12 bg-gray-200 rounded w-full mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) return <div className="p-8 text-center text-red-500">Error loading permissions</div>;

  const currentModules = activeTab === 'teacher' ? teacherModules : studentModules;
  const currentPermissions = activeTab === 'teacher' ? teacherPermissions : studentPermissions;

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FaShieldAlt className="text-2xl text-blue-500" />
          <h1 className="text-2xl font-bold text-gray-800">Access Management</h1>
        </div>
        <p className="text-gray-600">Control which modules are accessible for teachers and students</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('teacher')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                activeTab === 'teacher' 
                  ? 'bg-blue-500 text-white shadow' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaUserTie />
              <span>Teachers</span>
            </button>
            <button
              onClick={() => setActiveTab('student')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                activeTab === 'student' 
                  ? 'bg-green-500 text-white shadow' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaUserGraduate />
              <span>Students</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={() => enableAll(activeTab)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <FaLockOpen />
              <span>Enable All</span>
            </button>
            <button
              onClick={() => disableAll(activeTab)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <FaLock />
              <span>Disable All</span>
            </button>
            <button
              onClick={() => resetDefaults(activeTab)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <FaRedo />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {filteredModules(currentModules).map(module => (
            <div
              key={module.id}
              className="border rounded-xl p-5 hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => togglePermission(activeTab, module.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{module.icon}</span>
                  <h3 className="font-semibold text-gray-800">{module.name}</h3>
                </div>
                <div className="relative">
                  <div 
                    className={`w-12 h-6 rounded-full transition-colors ${
                      currentPermissions.includes(module.id) ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div 
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        currentPermissions.includes(module.id) ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {currentPermissions.includes(module.id) ? (
                  <span className="flex items-center gap-1 text-green-600 text-sm">
                    <FaCheck />
                    Access Enabled
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-600 text-sm">
                    <FaTimes />
                    Access Disabled
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredModules(currentModules).length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-3">🔍</div>
            <p>No modules found matching "{searchTerm}"</p>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={() => handleUpdatePermissions(activeTab)}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <FaCheck />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {toast.show && (
        <Toast 
          type={toast.type} 
          message={toast.message} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}
    </div>
  );
}

export default AccessManagement;
