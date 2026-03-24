import React from 'react'
import { Navigate } from 'react-router-dom';

function PrivateRoutes({allowedRoles,children}) {
const user = JSON.parse(localStorage.getItem("user"))
const token = localStorage.getItem("access")

if(!user || !token) return <Navigate to="/login" replace />

if (!allowedRoles.includes(user.user_type)){
    return <Navigate to="/not-found" replace/>
}

  return children;
}


export default PrivateRoutes
