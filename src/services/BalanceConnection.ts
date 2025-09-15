import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_REACT_APP_BE_URL}/api`;

export const getAllBalances = async (/*token: any*/) => {
    try {
        // console.log('getAllBalances ' + token);
        const response = await axios.get(`${API_BASE_URL}/balance/all`, {
            // headers: {
            //     Authorization: `Bearer ${token}`, 
            // },
        });
        return response.data;
    } catch (error) {
        console.error('There was an error fetching the balances!', error);
        throw error;
    }
};

export const getAllCanBalances = async (/*token: any*/) => {
    try {
        // console.log('getAllBalances ' + token);
        const response = await axios.get(`${API_BASE_URL}/canbalance/all`, {
            // headers: {
            //     Authorization: `Bearer ${token}`, 
            // },
        });
        return response.data;
    } catch (error) {
        console.error('There was an error fetching the balances!', error);
        throw error;
    }
};

export const getBalancesUser = async (/*token: any*/userId: number) => {
    try {
        // console.log('getAllBalances ' + token);
        const response = await axios.get(`${API_BASE_URL}/canbalanceuser/${userId}`, {
            // headers: {
            //     Authorization: `Bearer ${token}`, 
            // },
        });
        return response.data;
    } catch (error) {
        console.error('There was an error fetching the balances!', error);
        throw error;
    }
};

