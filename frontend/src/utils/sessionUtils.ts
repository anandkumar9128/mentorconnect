export const isSessionExpired = (date: string | Date, endTime: string) => {
  if (!date || !endTime) return false;
  const sessionDate = new Date(date);
  const [hours, minutes] = endTime.split(':').map(Number);
  sessionDate.setHours(hours, minutes, 0, 0);
  return new Date() > sessionDate;
};

export const isSessionActive = (date: string | Date, startTime: string, endTime: string) => {
  if (!date || !startTime || !endTime) return false;
  const sessionStart = new Date(date);
  const [sHours, sMins] = startTime.split(':').map(Number);
  sessionStart.setHours(sHours, sMins, 0, 0);
  
  const sessionEnd = new Date(date);
  const [eHours, eMins] = endTime.split(':').map(Number);
  sessionEnd.setHours(eHours, eMins, 0, 0);
  
  const now = new Date();
  // Allow joining up to 5 minutes early
  const earlyStart = new Date(sessionStart.getTime() - 5 * 60000);
  
  return now >= earlyStart && now <= sessionEnd;
};
