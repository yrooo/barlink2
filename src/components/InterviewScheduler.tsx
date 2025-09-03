'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Clock, MapPin, Video, X } from 'lucide-react';
import { InterviewFormData } from '@/types';
import { toast } from 'sonner';

interface InterviewSchedulerProps {
  applicationId: string;
  candidateName: string;
  position: string;
  onScheduled?: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function InterviewScheduler({
  applicationId,
  candidateName,
  position,
  onScheduled,
  isOpen,
  setIsOpen
}: InterviewSchedulerProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<InterviewFormData>({
    candidateName,
    position,
    date: '',
    time: '',
    type: 'online',
    location: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Partial<InterviewFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<InterviewFormData> = {};

    if (!formData.date) {
      newErrors.date = 'Tanggal interview wajib diisi';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = 'Tanggal interview tidak boleh di masa lalu';
      }
    }

    if (!formData.time) {
      newErrors.time = 'Waktu interview wajib diisi';
    }

    if (!formData.location) {
      if (formData.type === 'online') {
        newErrors.location = 'Link meeting wajib diisi untuk interview online';
      } else {
        newErrors.location = 'Lokasi wajib diisi untuk interview offline';
      }
    } else if (formData.type === 'online') {
      const urlPattern = /^(https?:\/\/)?(www\.)?(zoom\.us|meet\.google\.com|teams\.microsoft\.com)/i;
      if (!urlPattern.test(formData.location)) {
        newErrors.location = 'Masukkan link meeting yang valid (Zoom, Google Meet, atau Teams)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          ...formData
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setIsOpen(false);
        setFormData({
          candidateName,
          position,
          date: '',
          time: '',
          type: 'online',
          location: '',
          notes: ''
        });
        onScheduled?.();
        toast.success(result.message || 'Interview berhasil dijadwalkan!');
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.error || 'Gagal menjadwalkan interview'}`);
      }
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast.error('Terjadi kesalahan saat menjadwalkan interview');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof InterviewFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Jadwalkan Interview
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Read-only fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="candidateName">Kandidat</Label>
              <Input
                id="candidateName"
                value={formData.candidateName}
                readOnly
                className="bg-gray-50 border-2 border-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="position">Posisi</Label>
              <Input
                id="position"
                value={formData.position}
                readOnly
                className="bg-gray-50 border-2 border-gray-300"
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Tanggal Interview *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={`border-2 ${errors.date ? 'border-red-500' : 'border-black'}`}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
            </div>
            <div>
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Waktu Interview *
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className={`border-2 ${errors.time ? 'border-red-500' : 'border-black'}`}
              />
              {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
            </div>
          </div>

          {/* Interview Type */}
          <div>
            <Label htmlFor="type">Tipe Interview *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'online' | 'offline') => handleInputChange('type', value)}
            >
              <SelectTrigger className="border-2 border-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Online
                  </div>
                </SelectItem>
                <SelectItem value="offline">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Offline
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location/Meeting Link */}
          <div>
            <Label htmlFor="location" className="flex items-center gap-2">
              {formData.type === 'online' ? (
                <>
                  <Video className="w-4 h-4" />
                  Link Meeting *
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4" />
                  Lokasi Interview *
                </>
              )}
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder={
                formData.type === 'online'
                  ? 'https://zoom.us/j/... atau https://meet.google.com/...'
                  : 'Alamat lengkap lokasi interview'
              }
              className={`border-2 ${errors.location ? 'border-red-500' : 'border-black'}`}
            />
            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
          </div>

          {/* Additional Notes */}
          <div>
            <Label htmlFor="notes">Catatan Tambahan</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Catatan atau instruksi tambahan untuk kandidat..."
              className="border-2 border-black min-h-[100px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="neutral"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Menjadwalkan...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Jadwalkan Interview
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}