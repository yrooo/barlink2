import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

// Google Calendar service configuration
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

// Initialize Google Calendar client
export const getGoogleCalendarClient = () => {
  const credentials = {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  if (!credentials.client_email || !credentials.private_key) {
    throw new Error('Google Calendar credentials not found in environment variables');
  }

  const auth = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: SCOPES,
  });

  return google.calendar({ version: 'v3', auth });
};

// Create a calendar event
export const createCalendarEvent = async (eventData: {
  summary: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  attendeeEmails: string[];
  location?: string;
  meetingLink?: string;
}) => {
  try {
    const calendar = getGoogleCalendarClient();
    
    const event = {
      summary: eventData.summary,
      description: eventData.description,
      start: {
        dateTime: eventData.startDateTime,
        timeZone: 'Asia/Jakarta', // Adjust timezone as needed
      },
      end: {
        dateTime: eventData.endDateTime,
        timeZone: 'Asia/Jakarta',
      },
      attendees: eventData.attendeeEmails.map(email => ({ email })),
      location: eventData.location,
      conferenceData: eventData.meetingLink ? {
        createRequest: {
          requestId: `interview-${Date.now()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      } : undefined,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 30 }, // 30 minutes before
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: eventData.meetingLink ? 1 : 0,
      sendUpdates: 'all', // Send email invitations to all attendees
    });

    return {
      success: true,
      eventId: response.data.id,
      eventLink: response.data.htmlLink,
      meetingLink: response.data.conferenceData?.entryPoints?.[0]?.uri,
    };
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// Update a calendar event
export const updateCalendarEvent = async (eventId: string, eventData: {
  summary?: string;
  description?: string;
  startDateTime?: string;
  endDateTime?: string;
  attendeeEmails?: string[];
  location?: string;
}) => {
  try {
    const calendar = getGoogleCalendarClient();
    
    const updateData: any = {};
    
    if (eventData.summary) updateData.summary = eventData.summary;
    if (eventData.description) updateData.description = eventData.description;
    if (eventData.startDateTime) {
      updateData.start = {
        dateTime: eventData.startDateTime,
        timeZone: 'Asia/Jakarta',
      };
    }
    if (eventData.endDateTime) {
      updateData.end = {
        dateTime: eventData.endDateTime,
        timeZone: 'Asia/Jakarta',
      };
    }
    if (eventData.attendeeEmails) {
      updateData.attendees = eventData.attendeeEmails.map(email => ({ email }));
    }
    if (eventData.location) updateData.location = eventData.location;

    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      requestBody: updateData,
      sendUpdates: 'all',
    });

    return {
      success: true,
      eventId: response.data.id,
      eventLink: response.data.htmlLink,
    };
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// Delete a calendar event
export const deleteCalendarEvent = async (eventId: string) => {
  try {
    const calendar = getGoogleCalendarClient();
    
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
      sendUpdates: 'all',
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// Get calendar event details
export const getCalendarEvent = async (eventId: string) => {
  try {
    const calendar = getGoogleCalendarClient();
    
    const response = await calendar.events.get({
      calendarId: 'primary',
      eventId: eventId,
    });

    return {
      success: true,
      event: response.data,
    };
  } catch (error) {
    console.error('Error getting calendar event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};