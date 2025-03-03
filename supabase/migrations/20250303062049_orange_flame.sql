/*
  # Meeting Scheduler Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `created_at` (timestamp)
    
    - `meetings`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `location` (text)
      - `start_time` (timestamp)
      - `end_time` (timestamp)
      - `created_by` (uuid, foreign key to users.id)
      - `created_at` (timestamp)
    
    - `meeting_participants`
      - `id` (uuid, primary key)
      - `meeting_id` (uuid, foreign key to meetings.id)
      - `user_id` (uuid, foreign key to users.id)
      - `status` (text) - 'pending', 'accepted', 'declined'
      - `created_at` (timestamp)
    
    - `agenda_items`
      - `id` (uuid, primary key)
      - `meeting_id` (uuid, foreign key to meetings.id)
      - `title` (text)
      - `description` (text)
      - `duration_minutes` (integer)
      - `order` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  location text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  created_by uuid REFERENCES users(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create meeting participants table
CREATE TABLE IF NOT EXISTS meeting_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid REFERENCES meetings(id) NOT NULL,
  user_id uuid REFERENCES users(id) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  UNIQUE(meeting_id, user_id)
);

-- Create agenda items table
CREATE TABLE IF NOT EXISTS agenda_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid REFERENCES meetings(id) NOT NULL,
  title text NOT NULL,
  description text,
  duration_minutes integer,
  "order" integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_items ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for meetings table
CREATE POLICY "Users can read meetings they created or are invited to"
  ON meetings
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM meeting_participants
      WHERE meeting_id = meetings.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create meetings"
  ON meetings
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update meetings they created"
  ON meetings
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete meetings they created"
  ON meetings
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Create policies for meeting participants table
CREATE POLICY "Users can read participants for meetings they created or are invited to"
  ON meeting_participants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE id = meeting_participants.meeting_id AND created_by = auth.uid()
    ) OR
    user_id = auth.uid()
  );

CREATE POLICY "Users can add participants to meetings they created"
  ON meeting_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE id = meeting_participants.meeting_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update their own participant status"
  ON meeting_participants
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for agenda items table
CREATE POLICY "Users can read agenda items for meetings they created or are invited to"
  ON agenda_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE id = agenda_items.meeting_id AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM meeting_participants
          WHERE meeting_id = meetings.id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can manage agenda items for meetings they created"
  ON agenda_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE id = agenda_items.meeting_id AND created_by = auth.uid()
    )
  );