export type EventRecord = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  timezone: string;
  start_date: string;
  end_date: string;
  day_start_minutes: number;
  day_end_minutes: number;
  slot_minutes: number;
  created_at: string;
};

export type ParticipantRecord = {
  id: string;
  event_id: string;
  display_name: string;
  color_token: string;
  session_token_hash: string;
  created_at: string;
};

export type AvailabilityRecord = {
  participant_id: string;
  event_id: string;
  slot_ids: string[];
  updated_at: string;
};
