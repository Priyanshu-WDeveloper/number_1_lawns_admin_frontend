export const getToken = () => {
  return localStorage.getItem('token');
};

export const getUserRole = () => {
  return Number(localStorage.getItem('role'));
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const localLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('user');
};
