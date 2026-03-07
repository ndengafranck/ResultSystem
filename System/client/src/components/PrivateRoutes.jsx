import React from 'react'
import { Navigate } from 'react-router-dom';

function PrivateRoutes({children}) {
const user = JSON.parse(localStorage.getItem("user"))
const token = localStorage.getItem("access")

if(!user || !token) return <Navigate to="/login" replace />
  return children;
}

export default PrivateRoutes
