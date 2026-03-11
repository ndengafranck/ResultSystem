import React, { useEffect, useState } from 'react'

const Class = () => {
    const [classes,setClasses] = useState([]);
    const [isLoading,setIsLoading] = useState(true);

    useEffect(()=>{},[])
    return (

        <div>
            {isLoading ? 
            <p>Loading Classes.....</p>:
            classes.length > 0 ?
            <div>Class</div> :
            <p>No classes found for this staff.</p>}
        </div>
    )
}

export default Class
