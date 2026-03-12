import React, { useEffect, useState } from 'react'
import api from "../../services/api"
import styled from 'styled-components'

const ClassGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ClassItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid var(--border-color);
  border-radius: 6px;
`;
const Class = () => {
    const [classes,setClasses] = useState([]);
    const [isLoading,setIsLoading] = useState(true);

    useEffect(()=>{
        const fetchClasses = async ()=>{
            try{
            const res = await api.get("structure/classes");
            setClasses(res.data);
            console.log(res);
            }catch(err){
                console.log(err);
            }finally{
                setIsLoading(false);
            }
        }
        fetchClasses();
    },[])
    return (

        <div>
            {isLoading ? 
            <p>Loading Classes.....</p>:
            classes.length > 0 ?(
            <ClassGrid>
                <ClassItem style={{ background: 'var(--primary)', color: 'white', fontWeight: 'bold' }}>
                <div style={{ flex: 2 }}>Class Name</div>
                <div style={{ flex: 1 }}>Level</div>
                <div style={{ flex: 1 }}>Level Degree</div>
                </ClassItem>
                {classes.map((c) => (
                <ClassItem key={c.id}>
                    <div style={{ flex: 2 }}>{c.name}</div>
                    <div style={{ flex: 1 }}>{c.level}</div>
                    <div style={{ flex: 1 }}>{c.level_degree}</div>
                </ClassItem>
                ))}
            </ClassGrid>
            ):(
            <p>No classes found for this staff.</p>
        )}
        </div>
    )
}

export default Class
