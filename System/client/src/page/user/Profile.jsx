import React, { useEffect, useState } from 'react'
import api from '../../services/api';
const Profile = () => {
    const [profile,setProfile] = useState(null);

    useEffect(()=>{
        const fetchProfile = async()=>{
        try{
          const res = await api.get("user/profile/");
          setProfile(res.data);
          console.log(profile);
        }catch(err){
          console.log(`Profile error: ${err}`);
        }

      }
      fetchProfile();
    },[])
  return (
    <div>
      
    </div>
  )
}

export default Profile
