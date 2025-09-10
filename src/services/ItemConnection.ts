import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_REACT_APP_BE_URL}/api`;

export interface Item {
    itemId: number;
    price: number;
    date: string;
    description: string;
}

export interface CanItem {
    canItemId: number;
    price: number;
    date: string;
    description: string;
}

export const getAllItems = async (/*token: any*/) => {
    try {
        // console.log('getAllBalances ' + token);
        const response = await axios.get(`${API_BASE_URL}/item/all`, {
            // headers: {
            //     Authorization: `Bearer ${token}`, 
            // },
        });
        return response.data;
    } catch (error) {
        console.error('There was an error fetching the items!', error);
        throw error;
    }
};

export const createItem = async (/*token: any*/item :any) : Promise<any> => {
    try {
        // console.log('getAllBalances ' + token);
        const response = await axios.post(`${API_BASE_URL}/item/create`, item, {
            // headers: {
            //     Authorization: `Bearer ${token}`, 
            // },
        });
        return response.data;
    } catch (error) {
        console.error('There was an error fetching the items!', error);
        throw error;
    }
};

export const deleteItem = async (/*token: any*/itemId: number) : Promise<any> => {
    try {
        // console.log('getAllBalances ' + token);
        const response = await axios.delete(`${API_BASE_URL}/item/del/${itemId}`, {
            // headers: {
            //     Authorization: `Bearer ${token}`, 
            // },
        });
        return response.data;
    } catch (error) {
        console.error('There was an error deleting the item!', error);
        throw error;
    }
};

export const getAllCanItems = async (/*token: any*/) => {
    try {
        // console.log('getAllBalances ' + token);
        const response = await axios.get(`${API_BASE_URL}/canitem/all`, {
            // headers: {
            //     Authorization: `Bearer ${token}`, 
            // },
        });
        return response.data;
    } catch (error) {
        console.error('There was an error fetching the items!', error);
        throw error;
    }
};

export const createCanItem = async (/*token: any*/item :any) : Promise<any> => {
    try {
        // console.log('getAllBalances ' + token);
        const response = await axios.post(`${API_BASE_URL}/canitem/create`, item, {
            // headers: {
            //     Authorization: `Bearer ${token}`, 
            // },
        });
        return response.data;
    } catch (error) {
        console.error('There was an error fetching the items!', error);
        throw error;
    }
};

export const deleteCanItem = async (/*token: any*/itemId: number) : Promise<any> => {
    try {
        // console.log('getAllBalances ' + token);
        const response = await axios.delete(`${API_BASE_URL}/canitem/del/${itemId}`, {
            // headers: {
            //     Authorization: `Bearer ${token}`, 
            // },
        });
        return response.data;
    } catch (error) {
        console.error('There was an error deleting the item!', error);
        throw error;
    }
};