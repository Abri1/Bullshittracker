'use client';

import { useState } from 'react';

interface AddFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (field: { name: string; color: string }) => void;
  editField?: { id: string; name: string; color: string } | null;
  isSaving?: boolean;
}

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

export default function AddFieldModal({ isOpen, onClose, onAdd, editField, isSaving }: AddFieldModalProps) {
  const [name, setName] = useState(editField?.name || '');
  const [color, setColor] = useState(editField?.color || PRESET_COLORS[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSaving) return;

    onAdd({
      name: name.trim(),
      color,
    });

    setName('');
    setColor(PRESET_COLORS[0]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl p-6 animate-slide-up">
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6 sm:hidden" />

        <h2 className="text-xl font-bold mb-6">
          {editField ? 'Edit Field' : 'Add New Field'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Field Name */}
          <div>
            <label className="block text-sm text-muted mb-2">Field Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. North Paddock"
              className="w-full px-4 py-3 bg-background rounded-xl border border-white/10
                         focus:border-white/30 focus:outline-none transition-colors"
              autoFocus
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm text-muted mb-2">Color</label>
            <div className="flex flex-wrap gap-3">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-full transition-all ${
                    color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-card scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-background rounded-xl font-medium text-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-4 rounded-xl font-medium text-black disabled:opacity-50"
              style={{ backgroundColor: color }}
            >
              {isSaving ? 'Saving...' : editField ? 'Save Changes' : 'Add Field'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
