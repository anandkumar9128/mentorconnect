export interface VideoProvider {
  createMeeting(bookingId: string, mentorId: string, studentId: string): Promise<{ meetingId: string; meetingLink: string }>;
  endMeeting(meetingId: string): Promise<void>;
  generateUserToken(userId: string): string;
}
