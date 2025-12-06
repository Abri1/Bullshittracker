'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AddFieldModal from '@/components/AddFieldModal';

interface Field {
  id: string;
  name: string;
  color: string;
  is_active: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const [fields, setFields] = useState<Field[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const driver = localStorage.getItem('driver');
    if (!driver) {
      router.push('/');
      return;
    }

    // Fetch fields from Supabase
    const fetchFields = async () => {
      try {
        const { data, error } = await supabase
          .from('fields')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;
        setFields(data || []);
      } catch (error) {
        console.error('Error fetching fields:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFields();
  }, [router]);

  const handleAddField = async (field: { name: string; color: string }) => {
    setIsSaving(true);

    try {
      if (editingField) {
        // Update existing field
        const { data, error } = await supabase
          .from('fields')
          .update({
            name: field.name,
            color: field.color,
          })
          .eq('id', editingField.id)
          .select()
          .single();

        if (error) throw error;

        setFields(prev => prev.map(f => f.id === editingField.id ? data : f));
        setEditingField(null);
      } else {
        // Add new field (target_loads defaults in DB or we set a placeholder)
        const { data, error } = await supabase
          .from('fields')
          .insert({
            name: field.name,
            color: field.color,
            target_loads: 999, // Not used but required by DB
            is_active: true,
          })
          .select()
          .single();

        if (error) throw error;

        setFields(prev => [...prev, data]);
      }
    } catch (error) {
      console.error('Error saving field:', error);
      alert('Failed to save field. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditField = (field: Field) => {
    setEditingField(field);
    setShowModal(true);
  };

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm('Delete this field? This cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('fields')
        .delete()
        .eq('id', fieldId);

      if (error) throw error;

      setFields(prev => prev.filter(f => f.id !== fieldId));
    } catch (error) {
      console.error('Error deleting field:', error);
      alert('Failed to delete field. Please try again.');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingField(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-container page-enter">
      {/* Header - iOS style sticky header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-white/5 safe-area-top">
        <div className="px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-muted hover:text-white transition-colors"
          >
            ← Back
          </button>
          <h1 className="font-bold">Settings</h1>
          <div className="w-12" />
        </div>
      </header>

      <main className="p-4">
        {/* Fields Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Fields</h2>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-card rounded-xl text-sm font-medium hover:bg-card-hover transition-colors"
            >
              + Add Field
            </button>
          </div>

          <div className="space-y-3">
            {fields.filter(f => f.is_active).map(field => (
              <div
                key={field.id}
                className="bg-card rounded-2xl p-4 flex items-center gap-4"
              >
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: field.color }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{field.name}</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditField(field)}
                    className="p-2 text-muted hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteField(field.id)}
                    className="p-2 text-muted hover:text-danger transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {fields.filter(f => f.is_active).length === 0 && (
              <div className="text-center py-8 text-muted">
                <p>No fields yet. Add your first field to get started!</p>
              </div>
            )}
          </div>
        </section>

        {/* Info Section */}
        <section className="mt-8 p-4 bg-card rounded-2xl">
          <h3 className="font-semibold mb-2">How it works</h3>
          <ul className="text-muted text-sm space-y-2">
            <li>• Press and hold a field card for 1.5 seconds to log a dump</li>
            <li>• Swipe left on activity log entries to delete</li>
            <li>• Data syncs in real-time between devices</li>
          </ul>
        </section>

        {/* Sync Status */}
        <section className="mt-4 p-4 bg-card rounded-2xl flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-muted">Connected to cloud - syncing in real-time</span>
        </section>

        {/* Version */}
        <p className="text-center text-muted text-sm mt-8">
          Bullshit Tracker v1.0
        </p>
      </main>

      <AddFieldModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onAdd={handleAddField}
        editField={editingField}
        isSaving={isSaving}
      />
    </div>
  );
}
