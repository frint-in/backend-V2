export interface ISendEmail {
  email: string;
  emailType: "VERIFY" | "RESET";
  entityId: string;
  entityType: "USER" | "ORGANISATION";
}
export interface IMeetingDetails {
  summary: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  location: string;
  meetingLink: string;
}

export interface ISendEmailMain {
  email: string;
  emailType: "VERIFY" | "RESET" | "MEETING";
  userId: string;
  meetingDetails?: IMeetingDetails;
}
