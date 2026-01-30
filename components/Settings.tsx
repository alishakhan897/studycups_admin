import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Save, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react';
import type { User, Column, FormField } from '../types';
import { userApi } from '../services/apiService';
import { userColumns, userFormFields } from '../constants';
import { Modal } from './Modal';
import { DataManagement } from './DataManagement'; // Re-using for form logic

// Form component is local to DataManagement, so we need a copy here for the User form.
interface FormProps<T> {
    initialData: Partial<T> | null;
    fields: FormField[];
    onSubmit: (data: Partial<T>) => void;
    onCancel: () => void;
}

function Form<T>({ initialData, fields, onSubmit, onCancel }: FormProps<T>) {
    const [formData, setFormData] = useState<Partial<T>>(initialData || {});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
            {fields.map(field => (
                <div key={field.name}>
                    <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">{field.label}</label>
                    {field.type === 'select' ? (
                        <select
                            id={field.name}
                            name={field.name}
                            value={(formData as any)[field.name] || ''}
                            onChange={handleChange}
                            required={field.required}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">Select a role</option>
                            {field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    ) : (
                        <input
                            type={field.type}
                            id={field.name}
                            name={field.name}
                            value={(formData as any)[field.name] || ''}
                            onChange={handleChange}
                            required={field.required}
                            placeholder={field.placeholder}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    )}
                </div>
            ))}
            <div className="flex justify-end space-x-4 pt-4 border-t">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
                <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary">Save</button>
            </div>
        </form>
    );
}


const SettingsCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-md">
    <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">{title}</h3>
    {children}
  </div>
);

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await userApi.getAll();
            setUsers(result);
        } catch (err) {
            setError('Failed to fetch users');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleOpenModal = (user: Partial<User> | null = null) => {
        setCurrentUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentUser(null);
    };

    const handleSubmit = async (formData: Partial<User>) => {
        try {
            if (currentUser && 'id' in currentUser) {
                await userApi.update(currentUser.id as string, formData);
            } else {
                await userApi.add(formData as Omit<User, 'id'>);
            }
            fetchUsers();
            handleCloseModal();
        } catch (err) {
            console.error("Failed to save user", err);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await userApi.delete(id);
                fetchUsers();
            } catch (err) {
                console.error("Failed to delete user", err);
            }
        }
    };

    return (
        <SettingsCard title="User Management">
            <div className="flex justify-end mb-4">
                <button onClick={() => handleOpenModal()} className="flex items-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors">
                    <UserPlus size={18} className="mr-2" />
                    Add User
                </button>
            </div>
            {isLoading ? (
                 <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center h-40 bg-red-50 p-4 rounded-lg">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                    <p className="mt-2 font-semibold text-red-700">{error}</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                {userColumns.map(col => <th key={col.header} scope="col" className="px-6 py-3">{col.header}</th>)}
                                <th scope="col" className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                                    {userColumns.map(col => (
                                        <td key={col.header} className={`px-6 py-4 ${col.className || ''}`}>
                                             {typeof col.accessor === 'function' ? col.accessor(user) : String((user as any)[col.accessor as string] ?? '')}
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 text-right flex justify-end items-center space-x-4">
                                        <button onClick={() => handleOpenModal(user)} className="text-accent hover:text-secondary"><Edit size={18} /></button>
                                        <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {isModalOpen && (
                <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentUser && 'id' in currentUser ? 'Edit User' : 'Add User'}>
                    <Form initialData={currentUser} fields={userFormFields} onSubmit={handleSubmit} onCancel={handleCloseModal} />
                </Modal>
            )}
        </SettingsCard>
    );
};

export const Settings: React.FC = () => {
  const [siteTitle, setSiteTitle] = useState('College Admin Panel');
  const [logoName, setLogoName] = useState('');

  const handleGeneralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Settings saved!\nSite Title: ${siteTitle}\nLogo: ${logoName || 'No new logo selected'}`);
  };

  return (
    <div className="space-y-6">
      <SettingsCard title="General Settings">
        <form className="space-y-4" onSubmit={handleGeneralSubmit}>
          <div>
            <label htmlFor="siteTitle" className="block text-sm font-medium text-gray-700">Site Title</label>
            <input 
              type="text" 
              id="siteTitle" 
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
          </div>
          <div>
            <label htmlFor="siteLogo" className="block text-sm font-medium text-gray-700">Site Logo</label>
            <input 
              type="file" 
              id="siteLogo" 
              onChange={(e) => setLogoName(e.target.files?.[0]?.name || '')}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100"/>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="flex items-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors">
              <Save size={18} className="mr-2" />
              Save Settings
            </button>
          </div>
        </form>
      </SettingsCard>

      <UserManagement />
    </div>
  );
};