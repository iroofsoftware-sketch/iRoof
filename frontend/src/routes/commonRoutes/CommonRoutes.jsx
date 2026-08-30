import { Route, Routes } from 'react-router-dom'


import ForgotPassword from '../../common/ForgotPassword'
import ResetPassword from '../../common/ResetPassword'
import Login from '../../common/Login'
const CommonRoutes = () => {
  return (
    <Routes>

            <Route index element={<Login />} />
    </Routes>

  )
}

export default CommonRoutes
