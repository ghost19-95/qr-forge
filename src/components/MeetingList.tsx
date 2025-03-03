import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, Users, MapPin } from 'lucide-react';

interface MeetingListProps {
  userId: string;
}

interface Meeting {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string;
  end_time: string;
  created_by: string;
  created_at: string;
  participants: {
    id: string;
    status: string;
    user: {
      name: string;
      email: string;
    };
  }[];
  agenda_items: {
    id: string;
    title: string;
    description: string | null;
    duration_minutes: number | null;
    order: number;
  }[];
}

const MeetingList: React.FC<MeetingListProps> = ({ userId }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMeeting, setExpandedMeeting] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        // Get meetings where user is creator or participant
        const { data: createdMeetings, error: createdError } = await supabase
          .from('meetings')
          .select(`
            *,
            participants:meeting_participants(
              id,
              status,
              user:users(name, email)
            ),
            agenda_items:agenda_items(
              id,
              title,
              description,
              duration_minutes,
              order
            )
          `)
          .eq('created_by', userId)
          .order('start_time', { ascending: true });

        if (createdError) throw createdError;

        const { data: participatingMeetings, error: participatingError } = await supabase
          .from('meetings')
          .select(`
            *,
            participants:meeting_participants(
              id,
              status,
              user:users(name, email)
            ),
            agenda_items:agenda_items(
              id,
              title,
              description,
              duration_minutes,
              order
            )
          `)
          .neq('created_by', userId)
          .eq('meeting_participants.user_id', userId)
          .order('start_time', { ascending: true });

        if (participatingError) throw participatingError;

        // Combine and sort meetings
        const allMeetings = [...(createdMeetings || []), ...(participatingMeetings || [])];
        allMeetings.sort((a, b) => 
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );

        setMeetings(allMeetings as Meeting[]);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [userId]);

  const toggleMeetingExpand = (meetingId: string) => {
    if (expandedMeeting === meetingId) {
      setExpandedMeeting(null);
    } else {
      setExpandedMeeting(meetingId);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'EEEE d MMMM yyyy', { locale: fr });
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm');
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <p>Chargement des réunions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded">
        Erreur: {error}
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">Aucune réunion planifiée</h3>
        <p className="text-gray-500">
          Vous n'avez pas encore de réunions planifiées. Créez-en une nouvelle pour commencer.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {meetings.map((meeting) => (
        <div
          key={meeting.id}
          className="bg-white rounded-lg shadow overflow-hidden"
        >
          <div
            className="p-6 cursor-pointer"
            onClick={() => toggleMeetingExpand(meeting.id)}
          >
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-medium text-gray-900">{meeting.title}</h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {meeting.created_by === userId ? 'Organisateur' : 'Invité'}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                <span>{formatDate(meeting.start_time)}</span>
              </div>

              <div className="flex items-center text-gray-600">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                <span>
                  {formatTime(meeting.start_time)} - {formatTime(meeting.end_time)}
                </span>
              </div>

              {meeting.location && (
                <div className="flex items-center text-gray-600 md:col-span-2">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  <span>{meeting.location}</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center text-gray-600">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              <span>
                {meeting.participants?.length || 0} participant
                {meeting.participants?.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {expandedMeeting === meeting.id && (
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              {meeting.description && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                  <p className="text-gray-600">{meeting.description}</p>
                </div>
              )}

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Participants</h4>
                <ul className="bg-white rounded border border-gray-200 divide-y divide-gray-200">
                  {meeting.participants?.map((participant) => (
                    <li key={participant.id} className="p-3 flex justify-between items-center">
                      <div>
                        <span className="font-medium">{participant.user.name}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          {participant.user.email}
                        </span>
                      </div>
                      <span className={`text-sm px-2 py-1 rounded ${
                        participant.status === 'accepted' 
                          ? 'bg-green-100 text-green-800' 
                          : participant.status === 'declined'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {participant.status === 'accepted' 
                          ? 'Accepté' 
                          : participant.status === 'declined'
                          ? 'Refusé'
                          : 'En attente'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {meeting.agenda_items && meeting.agenda_items.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Ordre du jour</h4>
                  <ul className="bg-white rounded border border-gray-200 divide-y divide-gray-200">
                    {meeting.agenda_items
                      .sort((a, b) => a.order - b.order)
                      .map((item) => (
                        <li key={item.id} className="p-3">
                          <div className="flex items-center">
                            <span className="font-medium">{item.title}</span>
                            {item.duration_minutes && (
                              <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                {item.duration_minutes} min
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-500 mt-1">
                              {item.description}
                            </p>
                          )}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MeetingList;