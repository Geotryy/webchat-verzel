import { google } from "googleapis";
import { addDays, setHours, setMinutes, startOfDay, format } from "date-fns";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CALENDAR_CLIENT_ID,
  process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
  process.env.GOOGLE_CALENDAR_REDIRECT_URI
);

// Token de acesso será configurado via admin panel
let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setGoogleTokens(access: string, refresh?: string) {
  accessToken = access;
  if (refresh) refreshToken = refresh;
  
  oauth2Client.setCredentials({
    access_token: access,
    refresh_token: refresh,
  });
}

export function getAuthUrl(): string {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar"],
  });
}

export async function exchangeCodeForTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  
  if (tokens.access_token) {
    setGoogleTokens(tokens.access_token, tokens.refresh_token || undefined);
  }
  
  return tokens;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  formatted: string;
}

export async function getAvailableSlots(daysAhead: number = 7): Promise<TimeSlot[]> {
  if (!accessToken) {
    throw new Error("Google Calendar não está autenticado");
  }

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  
  const now = new Date();
  const timeMin = startOfDay(addDays(now, 1)); // Começa amanhã
  const timeMax = addDays(timeMin, daysAhead);

  try {
    // Buscar eventos existentes
    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    const busySlots = response.data.items || [];
    
    // Gerar slots disponíveis (9h-17h, seg-sex)
    const availableSlots: TimeSlot[] = [];
    
    for (let i = 1; i <= daysAhead; i++) {
      const day = addDays(startOfDay(now), i);
      const dayOfWeek = day.getDay();
      
      // Pular fins de semana
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;
      
      // Horários: 9h, 11h, 14h, 16h
      const hours = [9, 11, 14, 16];
      
      for (const hour of hours) {
        const slotStart = setMinutes(setHours(day, hour), 0);
        const slotEnd = setMinutes(setHours(day, hour + 1), 0);
        
        // Verificar se o slot está ocupado
        const isOccupied = busySlots.some(event => {
          const eventStart = new Date(event.start?.dateTime || event.start?.date || "");
          const eventEnd = new Date(event.end?.dateTime || event.end?.date || "");
          
          return (
            (slotStart >= eventStart && slotStart < eventEnd) ||
            (slotEnd > eventStart && slotEnd <= eventEnd)
          );
        });
        
        if (!isOccupied) {
          availableSlots.push({
            start: slotStart,
            end: slotEnd,
            formatted: format(slotStart, "dd/MM/yyyy 'às' HH:mm"),
          });
        }
      }
    }
    
    return availableSlots.slice(0, 3); // Retornar apenas 3 opções
  } catch (error) {
    console.error("Error fetching calendar slots:", error);
    throw new Error("Falha ao buscar horários disponíveis");
  }
}

export async function scheduleEvent(
  leadName: string,
  leadEmail: string,
  startTime: Date,
  endTime: Date,
  description?: string
): Promise<string> {
  if (!accessToken) {
    throw new Error("Google Calendar não está autenticado");
  }

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  try {
    const event = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: `Reunião com ${leadName}`,
        description: description || "Reunião de qualificação agendada via webchat",
        start: {
          dateTime: startTime.toISOString(),
          timeZone: "America/Sao_Paulo",
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: "America/Sao_Paulo",
        },
        attendees: [{ email: leadEmail }],
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      },
      conferenceDataVersion: 1,
      sendUpdates: "all",
    });

    return event.data.hangoutLink || event.data.htmlLink || "";
  } catch (error) {
    console.error("Error scheduling event:", error);
    throw new Error("Falha ao agendar reunião");
  }
}

