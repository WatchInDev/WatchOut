import React, { useState, useCallback, useEffect } from 'react';
import dayjs from 'dayjs';
import { useCreateEvent } from './events.hooks';
import type { Coordinates, CreateEventRequest } from '../../types';
import { reverseGeocode } from '../map/reverseGeocode';
import { EventTypeSelectionModal } from './EventTypeSelectionModal';

type CreateEventProps = {
  location: Coordinates;
  onSuccess: () => void;
};

type FormData = {
  name: string;
  description: string;
  eventTypeId: number | null;
};

export const CreateEventBottomSheet: React.FC<CreateEventProps> = ({ location, onSuccess }) => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(true);
  }, []);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    eventTypeId: null,
  });

  const [selectedEventType, setSelectedEventType] = useState<{
    id: number;
    name: string;
    icon: string;
  } | null>(null);

  const handleSetSelectedEventType = (
    eventType: { id: number; name: string; icon: string } | null
  ) => {
    setSelectedEventType(eventType);
    setFormData((prev) => ({ ...prev, eventTypeId: eventType?.id ?? null }));
  };

  const [eventTypeModalVisible, setEventTypeModalVisible] = useState(false);

  const [geocodedAddress, setGeocodedAddress] = useState<string>('Ładowanie lokalizacji...');
  useEffect(() => {
    reverseGeocode(location)
      .then((address) => setGeocodedAddress(address))
      .catch(() => setGeocodedAddress('Nieznana lokalizacja'));
  }, [location]);

  const createEventMutation = useCreateEvent();

  const updateField = (field: keyof FormData, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = useCallback(() => {
    setFormData({ name: '', description: '', eventTypeId: null });
    setSelectedEventType(null);
  }, []);

  const validateForm = useCallback(() => {
    const { name, description, eventTypeId } = formData;
    return Boolean(name && description && eventTypeId !== null);
  }, [formData]);

  const handleSubmit = () => {
    if (!validateForm()) {
      window.alert('Błąd: Wszystkie pola muszą być wypełnione.');
      return;
    }

    const dateInOneHour = dayjs().add(3, 'hours');

    const requestData: CreateEventRequest = {
      name: formData.name,
      description: formData.description,
      latitude: location.latitude,
      longitude: location.longitude,
      endDate: dateInOneHour.toISOString(),
      image: null,
      eventTypeId: formData.eventTypeId!,
    };

    createEventMutation.mutate(requestData, {
      onSuccess: () => {
        window.alert('Sukces! Nowe zdarzenie zostało zgłoszone.');
        resetForm();
        setOpen(false);
        onSuccess();
      },
      onError: (error) => {
        window.alert(`Błąd: Nie udało się zgłosić zdarzenia. Spróbuj ponownie. ${error?.message ?? ''}`);
      },
    });
  };

  const isLoading = !!(createEventMutation as any).isLoading || !!(createEventMutation as any).isPending;

  if (!open) return null;

  return (
    <>
      {/* overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* bottom sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
        role="dialog"
        aria-modal="true"
        aria-label="Create event"
      >
        <div className="w-full max-w-lg bg-white rounded-t-xl p-6 shadow-lg">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold">Zgłoś nowe zdarzenie!</h3>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tytuł zdarzenia</label>
              <input
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Tytuł"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opis zdarzenia</label>
              <textarea
                className="w-full border rounded px-3 py-2 h-24 resize-none focus:outline-none focus:ring focus:border-blue-300"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Opis"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rodzaj zdarzenia</label>
              <button
                type="button"
                onClick={() => setEventTypeModalVisible(true)}
                className="w-full text-left border rounded px-3 py-2 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  {selectedEventType ? (
                    <>
                      <span className="text-xl">{selectedEventType.icon}</span>
                      <span>{selectedEventType.name}</span>
                    </>
                  ) : (
                    <span className="text-gray-500">Wybierz rodzaj zdarzenia</span>
                  )}
                </div>
                <span className="text-gray-400">▾</span>
              </button>
            </div>

            <div className="text-sm text-gray-700">
              <strong>Lokalizacja:</strong> <span>{geocodedAddress}</span>
            </div>

            <div className="mt-4">
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`w-full py-2 rounded text-white ${isLoading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isLoading ? 'Zgłaszanie...' : 'Zgłoś zdarzenie'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <EventTypeSelectionModal
        isVisible={eventTypeModalVisible}
        setIsVisible={setEventTypeModalVisible}
        eventType={selectedEventType}
        setEventType={handleSetSelectedEventType}
      />
    </>
  );
};
