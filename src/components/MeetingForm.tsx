import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { Calendar, Clock, Users, MapPin, Plus, X } from 'lucide-react';

interface MeetingFormProps {
  userId: string;
  onSuccess: () => void;
}

interface FormData {
  title: string;
  description: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
}

const MeetingForm: React.FC<MeetingFormProps> = ({ userId, onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();
  
  const [participants, setParticipants] = useState<{ email: string; name: string }[]>([]);
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [newParticipantName, setNewParticipantName] = useState('');
  
  const [agendaItems, setAgendaItems] = useState<{ title: string; description: string; duration: number }[]>([]);
  const [newAgendaTitle, setNewAgendaTitle] = useState('');
  const [newAgendaDescription, setNewAgendaDescription] = useState('');
  const [newAgendaDuration, setNewAgendaDuration] = useState(15);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addParticipant = () => {
    if (newParticipantEmail && newParticipantName) {
      setParticipants([
        ...participants,
        { email: newParticipantEmail, name: newParticipantName },
      ]);
      setNewParticipantEmail('');
      setNewParticipantName('');
    }
  };

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const addAgendaItem = () => {
    if (newAgendaTitle) {
      setAgendaItems([
        ...agendaItems,
        {
          title: newAgendaTitle,
          description: newAgendaDescription,
          duration: newAgendaDuration,
        },
      ]);
      setNewAgendaTitle('');
      setNewAgendaDescription('');
      setNewAgendaDuration(15);
    }
  };

  const removeAgendaItem = (index: number) => {
    setAgendaItems(agendaItems.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    try {
      // Combine date and time
      const startDateTime = new Date(`${data.date}T${data.startTime}`);
      const endDateTime = new Date(`${data.date}T${data.endTime}`);

      // Create meeting
      const { data: meetingData, error: meetingError } = await supabase
        .from('meetings')
        .insert({
          title: data.title,
          description: data.description,
          location: data.location,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          created_by: userId,
        })
        .select()
        .single();

      if (meetingError) throw meetingError;

      const meetingId = meetingData.id;

      // Process participants
      for (const participant of participants) {
        // Check if user exists
        let participantId;
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', participant.email)
          .single();

        if (existingUser) {
          participantId = existingUser.id;
        } else {
          // Create user if doesn't exist
          const { data: newUser, error: newUserError } = await supabase
            .from('users')
            .insert({
              email: participant.email,
              name: participant.name,
            })
            .select()
            .single();

          if (newUserError) throw newUserError;
          participantId = newUser.id;
        }

        // Add participant to meeting
        const { error: participantError } = await supabase
          .from('meeting_participants')
          .insert({
            meeting_id: meetingId,
            user_id: participantId,
            status: 'pending',
          });

        if (participantError) throw participantError;
      }

      // Process agenda items
      for (let i = 0; i < agendaItems.length; i++) {
        const item = agendaItems[i];
        const { error: agendaError } = await supabase
          .from('agenda_items')
          .insert({
            meeting_id: meetingId,
            title: item.title,
            description: item.description,
            duration_minutes: item.duration,
            order: i + 1,
          });

        if (agendaError) throw agendaError;
      }

      reset();
      setParticipants([]);
      setAgendaItems([]);
      onSuccess();
    } catch (error: any) {
      setError(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-blue-600" /> Détails de la réunion
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre
              </label>
              <input
                type="text"
                {...register('title', { required: 'Le titre est requis' })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lieu
              </label>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  {...register('location')}
                  placeholder="Salle de réunion, Lien Zoom, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              {...register('date', { required: 'La date est requise' })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heure de début
              </label>
              <input
                type="time"
                {...register('startTime', { required: "L'heure de début est requise" })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.startTime && (
                <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heure de fin
              </label>
              <input
                type="time"
                {...register('endTime', { required: "L'heure de fin est requise" })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.endTime && (
                <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          <div className="md:col-span-2 mt-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
              <Users className="mr-2 h-5 w-5 text-blue-600" /> Participants
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  value={newParticipantName}
                  onChange={(e) => setNewParticipantName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newParticipantEmail}
                  onChange={(e) => setNewParticipantEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={addParticipant}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                >
                  <Plus className="mr-1 h-4 w-4" /> Ajouter
                </button>
              </div>
            </div>

            {participants.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Participants ({participants.length})
                </h4>
                <ul className="space-y-2">
                  {participants.map((participant, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center bg-white p-2 rounded border border-gray-200"
                    >
                      <div>
                        <span className="font-medium">{participant.name}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          {participant.email}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeParticipant(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="md:col-span-2 mt-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
              <List className="mr-2 h-5 w-5 text-blue-600" /> Ordre du jour
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre
                </label>
                <input
                  type="text"
                  value={newAgendaTitle}
                  onChange={(e) => setNewAgendaTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newAgendaDescription}
                  onChange={(e) => setNewAgendaDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durée (min)
                </label>
                <input
                  type="number"
                  value={newAgendaDuration}
                  onChange={(e) => setNewAgendaDuration(parseInt(e.target.value))}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-6 flex justify-end">
                <button
                  type="button"
                  onClick={addAgendaItem}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                >
                  <Plus className="mr-1 h-4 w-4" /> Ajouter un point
                </button>
              </div>
            </div>

            {agendaItems.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Points à l'ordre du jour ({agendaItems.length})
                </h4>
                <ul className="space-y-2">
                  {agendaItems.map((item, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center bg-white p-3 rounded border border-gray-200"
                    >
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="font-medium">{item.title}</span>
                          <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            {item.duration} min
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAgendaItem(index)}
                        className="text-red-500 hover:text-red-700 ml-4"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {loading ? 'Création...' : 'Créer la réunion'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MeetingForm;