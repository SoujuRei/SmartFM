import axiosClient from './axiosClient';

interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    axiosClient.post<{ access_token: string; user: { id: string; name: string; email: string; role: string } }>(
      '/auth/login',
      payload,
    ),
};
