import { createSlice } from '@reduxjs/toolkit'

export const userSighIn = createSlice({
  name: 'user',
  initialState: {
    user: false,
    email: null,
    id: null
  },
  reducers: {
    logIn: (state, action) => ({...state, user: true, email: action.payload.email, id: action.payload.id}),
 
    logOut: (state) => ({...state, user: false, email: null, id: null}),
  },
})

export const { logIn, logOut } = userSighIn.actions

export const selectUser = state => state.user

export default userSighIn.reducer
