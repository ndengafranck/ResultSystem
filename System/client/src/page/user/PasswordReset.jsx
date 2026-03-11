import React, { useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const PasswordReset = () => {
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [new_password,setNewPassword] = useState("");
    const [error,setError] = useState("");

    const navigate = useNavigate();
    const handleSubmit = async (e) => {
            e.preventDefault();
            try{
                const res = await api.put(`user/change-password/`,{ email, password,new_password });
                console.log(res);
                navigate("/profile");
            }catch(err){
                console.log(`Update password error: ${err}`);
                setError("Invalid credentials. Please try again.");
            }
        }      
    return (
        <div>
            <h3>Update Your Password</h3>
            {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>{error}</div>}
            <form className='form-group' onSubmit={handleSubmit}>
            <div>
                <label htmlFor="email">E-mail</label>
                <input type="email" name="email" className='form-input' onChange={(e) =>{setEmail(e.target.value)}} required />
            </div>
            <div className='form-group'>
                <label htmlFor="password">Present Password</label>
                <input type="password" name="password" className='form-input' onChange={(e)=>{setPassword(e.target.value)}} required />
            </div>
            <div className='form-group'>
                <label htmlFor="new_password">New Password</label>
                <input type="password" name="new_password" className='form-input' onChange={(e)=>{setNewPassword(e.target.value)}} required />
            </div>
            <div className="form-group">
                <button type="submit" className='btn btn-primary'>Update</button>
            </div>
            </form>
        </div>
    )
}

export default PasswordReset
