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
  const [signature, setSignature] = useState(null);
  const [sigFile, setSigFile] = useState(null);
  const [sigMessage, setSigMessage] = useState('');
  const [sigUploading, setSigUploading] = useState(false);

  const canUploadSignature = profile && ['Director', 'HOD', 'Staff'].includes(profile.role);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("user/profile/");
        setProfile(res.data);
      } catch (err) {
        console.log(`Profile error: ${err}`);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (canUploadSignature) {
      api.get("user/signature/").then(res => {
        if (res.data.signature) setSignature(res.data.signature);
      }).catch(() => {});
    }
  }, [canUploadSignature]);

  const handleSignatureUpload = async () => {
    if (!sigFile) return;
    setSigUploading(true);
    setSigMessage('');
    const formData = new FormData();
    formData.append('signature', sigFile);
    try {
      const res = await api.post("user/signature/", formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSignature(res.data.signature);
      setSigMessage('Signature uploaded successfully.');
      setSigFile(null);
    } catch (err) {
      setSigMessage(err.response?.data?.error || 'Upload failed.');
    } finally {
      setSigUploading(false);
    }
  };

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
      {profile.school &&
        <div>
        <label htmlFor="schoole"><FaVenusMars/> School: </label>
        <input type="text" value={profile.school} className='form-input' disabled />
      </div>
      }
      <div>
        <label htmlFor="dob"><MdDateRange/> Date Of Birth: </label>
        <input type="date" value={profile.dob} className='form-input' disabled />
      </div>
      <div>
        <label htmlFor="gender"><FaVenusMars/> Gender: </label>
        <input type="text" value={profile.gender} className='form-input' disabled />
      </div>
      

      {/* Digital Signature Section */}
      {canUploadSignature && (
        <div style={{ marginTop: '1.5rem', padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--card-bg)' }}>
          <h4 style={{ margin: '0 0 1rem 0' }}>Digital Signature</h4>
          {signature ? (
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Current signature:</p>
              <img src={signature} alt="Digital signature" style={{ maxHeight: '80px', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.5rem', background: 'white' }} />
            </div>
          ) : (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>No signature uploaded yet.</p>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="file"
              accept="image/*"
              onChange={e => setSigFile(e.target.files[0])}
              style={{ fontSize: '0.875rem' }}
            />
            <button
              className="btn btn-primary"
              onClick={handleSignatureUpload}
              disabled={!sigFile || sigUploading}
              style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }}
            >
              {sigUploading ? 'Uploading...' : signature ? 'Replace Signature' : 'Upload Signature'}
            </button>
          </div>
          {sigMessage && (
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: sigMessage.includes('success') ? '#16a34a' : '#dc2626' }}>{sigMessage}</p>
          )}
        </div>
      )}

      <div className='justify-space' style={{ marginTop: '1.5rem' }}>
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
