import api from "./api";

export const getAccessToken = () => localStorage.getItem("access");
export const getRefreshToken = () => localStorage.getItem("refresh");


export const saveTokens = (access,refresh,user) =>{
    if (access) localStorage.setItem("access", access)
    if (refresh) localStorage.setItem("refresh",refresh)
    if (user) localStorage.setItem("user",JSON.stringify(user))
};

export const clearTokens = () =>{
    localStorage.removeItem("access")
    localStorage.removeItem("refresh")
};

export const refreshToken = async () =>{
    const refresh = getRefreshToken()

    if(!refresh) return null;

    try{
        const response = await api.post("/refresh-token/",{refresh});
        const newAccess = response.data.access;
        saveTokens(newAccess,refresh)
        console.log("new token gotten ")
        return newAccess;
    }catch(err){
        console.warn(`Refresh invalide or Expired ${err}`)
        
        clearTokens();
        return null;
    }
}


