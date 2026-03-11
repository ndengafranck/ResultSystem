import React, { useEffect, useState } from 'react'
import api from '../../services/api';
import { logOut } from '../../services/auth';
import { Link } from 'react-router-dom';
import PasswordReset from './PasswordReset';
import { RiLockPasswordLine } from 'react-icons/ri';
import { MdDateRange, MdEmail, MdPhone } from 'react-icons/md';
import { FaIdCard, FaUser, FaUserTag, FaVenusMars } from 'react-icons/fa';
const Profile = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("user/profile/");
        setProfile(res.data);
        console.log(profile);
      } catch (err) {
        console.log(`Profile error: ${err}`);
      }

    }
    fetchProfile();
  }, [])
  return (
    <>
    {profile ?
    <div className="form-group">
        <div>
            <img src={profile.profile} alt="profile pic" style={{width:"7.1rem"}}/>
        </div>
      <div>
        <label htmlFor="name"><FaUser/> Name: </label>
        <input type="text" value={profile.fullname} className='form-input' disabled />
      </div>
      <div>
        <label htmlFor="matricule"><FaIdCard/> Matricule: </label>
        <input type="text" value={profile.matricule} className='form-input' disabled />
      </div>
      <div>
        <label htmlFor="smail"><MdEmail/> School-mail: </label>
        <input type="text" value={profile.email} className='form-input' disabled />
      </div>
      <div>
        <label htmlFor="phone"><MdPhone/> Phone: </label>
        <input type="text" value={profile.phone} className='form-input' disabled />
      </div>
      <div>
        <label htmlFor="role"><FaUserTag/> Role: </label>
        <input type="text" value={profile.role} className='form-input' disabled />
      </div>
      <div>
        <label htmlFor="dob"><MdDateRange/> Date Of Birth: </label>
        <input type="date" value={profile.dob} className='form-input' disabled />
      </div>
      <div>
        <label htmlFor="gender"><FaVenusMars/> Gender: </label>
        <input type="text" value={profile.gender} className='form-input' disabled />
      </div>
      <div className='justify-space'>
        <button onClick={() => { logOut() }} className='btn btn-accent'>logout</button>
        <Link className='btn btn-primary' to="/update/password"> <RiLockPasswordLine/> change password</Link>
      </div>
    </div>
     : "Please login !!!!"
    }
    </>
  )
}

export default Profile
