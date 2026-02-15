
import { ClockifyUser, ClockifyWorkspace, ClockifyTimeEntry } from '../types';

const BASE_URL = 'https://api.clockify.me/api/v1';

export class ClockifyService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async fetchWithErrorHandling(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        'X-Api-Key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    return response.json();
  }

  async getUser(): Promise<ClockifyUser> {
    return this.fetchWithErrorHandling(`${BASE_URL}/user`);
  }

  async getWorkspaces(): Promise<ClockifyWorkspace[]> {
    return this.fetchWithErrorHandling(`${BASE_URL}/workspaces`);
  }

  async getTimeEntries(workspaceId: string, userId: string, start: Date, end: Date): Promise<ClockifyTimeEntry[]> {
    const params = new URLSearchParams({
      start: start.toISOString(),
      end: end.toISOString(),
      hydrated: 'true',
      limit: '1000',
    });
    return this.fetchWithErrorHandling(`${BASE_URL}/workspaces/${workspaceId}/user/${userId}/time-entries?${params}`);
  }
}
