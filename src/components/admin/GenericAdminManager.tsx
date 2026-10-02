import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface GenericAdminManagerProps {
  collectionName: string;
  title: string;
  fields: { name: string; label: string; type: string }[];
}

export const GenericAdminManager: React.FC<GenericAdminManagerProps> = ({ collectionName, title, fields }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const q = query(collection(db, collectionName));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, [collectionName]);

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত?')) {
      await deleteDoc(doc(db, collectionName, id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, collectionName, editingId), formData);
      } else {
        await addDoc(collection(db, collectionName), formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({});
    } catch (err) {
      console.error(err);
      alert('Error saving data.');
    }
  };

  if (loading) return <div className="p-8 text-center">লোড হচ্ছে...</div>;

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setFormData({}); }}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700"
        >
          <Plus size={18} /> নতুন যোগ করুন
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">{editingId ? 'এডিট করুন' : 'নতুন যুক্ত করুন'}</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-red-500">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map(field => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  ) : field.type === 'checkbox' ? (
                    <input
                      type="checkbox"
                      checked={formData[field.name] || false}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.checked })}
                      className="w-5 h-5 text-emerald-600 rounded"
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500"
                      required={field.type !== 'url'}
                    />
                  )}
                </div>
              ))}
            </div>
            <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700">
              সেভ করুন
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              {fields.slice(0, 3).map(f => (
                <th key={f.name} className="px-6 py-3 text-sm font-bold text-gray-500">{f.label}</th>
              ))}
              <th className="px-6 py-3 text-sm font-bold text-gray-500 text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                {fields.slice(0, 3).map(f => (
                  <td key={f.name} className="px-6 py-4 text-sm text-gray-800">
                    {f.type === 'checkbox' ? (item[f.name] ? 'হ্যাঁ' : 'না') : item[f.name]}
                  </td>
                ))}
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800 p-2"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 p-2 ml-2"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">কোন তথ্য নেই</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
