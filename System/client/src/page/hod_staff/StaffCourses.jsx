import React, { useEffect, useState } from 'react'
import api from '../../services/api';
import styled from 'styled-components';



const CourseGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CourseItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid var(--border-color);
  border-radius: 6px;
`;
const StaffCourses = () => {
    const [courses,setCourses] = useState([]);
    const [isLoading,setIsLoading] = useState(true);

    useEffect(()=>{
        const fetchCourses = async () =>{
            try{
                const res = await api.get("academic/courses");
                console.log(res);
                setCourses(res.data);
            }catch(err){
                console.log(`Error in fetching courses ${err}`);
            }finally{
                setIsLoading(false);
            }
        }
        fetchCourses();
    },[])
    return (
        <div>
           {isLoading ? 
            <p>Loading Courses.....</p>:
            courses.length > 0 ?(
            <CourseGrid>
                <CourseItem style={{ background: 'var(--primary)', color: 'white', fontWeight: 'bold' }}>
                <div style={{ flex: 1 }}>Course code</div>
                <div style={{ flex: 2 }}>Course name</div>
                <div style={{ flex: 1 }}>Semester number</div>
                <div style={{ flex: 1 }}>academic year</div>
                </CourseItem>
                {courses.map((c) => (
                <CourseItem key={c.id}>
                    <div style={{ flex: 1 }}>{c.code}</div>
                    <div style={{ flex: 2 }}>{c.name}</div>
                    <div style={{ flex: 1 }}>{c.semester_num}</div>
                    <div style={{ flex: 1 }}>{c.academic_year}</div>
                </CourseItem>
                ))}
            </CourseGrid>
            ):(
            <p>No course found in this department.</p>
        )}
        </div>
    )
}

export default StaffCourses
