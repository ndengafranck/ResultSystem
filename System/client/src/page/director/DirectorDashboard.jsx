import React, { useEffect, useState } from 'react'
import api from '../../services/api'

const DirectorDashboard = () => {
  const [loading, setLoading] = useState(true)

  return (
    <div>
      {loading ?
        <p>Loading Dashboard data.......</p>
        : ""}
    </div>
  )
}

export default DirectorDashboard
