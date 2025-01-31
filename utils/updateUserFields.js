// Helper function to update user fields
export const updateUserFields = (user, data) => {
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined && data[key] !== user[key]) {
      user[key] = data[key];
    }
  });
};
