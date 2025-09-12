import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_REACT_APP_BE_URL}/api`;

export const getAllUsers = async (/*token: any*/) => {
    try {
        // console.log('getAllUsers ' + token);
        const response = await axios.get(`${API_BASE_URL}/user/all`, {
            // headers: {
            //     Authorization: `Bearer ${token}`, 
            // },
        });
        return response.data;
    } catch (error) {
        console.error('There was an error fetching the users!', error);
        throw error;
    }
};



