import { configureStore } from '@reduxjs/toolkit';
import userSighIn from './user';

export default configureStore({
  reducer: {
    user: userSighIn,
  },
});