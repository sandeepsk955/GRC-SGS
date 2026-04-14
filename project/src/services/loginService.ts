import axios from 'axios';


const API_BASE = '/api'; // Using relative path for Vite proxy
// const API_BASE = import.meta.env.VITE_API_BASE ;

console.log("API_BASE:", API_BASE);


export const loginService = {


    addLogin: async (email: string, password: string, scid: string) => {
        return axios.post(
            `${API_BASE}/userLogin?scid=${scid}`,
            { email, password }, // body
            {
                headers: {
                    'Accept': 'text/plain',
                    'Content-Type': 'application/json',
                },
            }
        );
    },

    addMfa(userid: number, code: string, scid: string) {
        return axios.post(`${API_BASE}/userAuthentication?scid=${scid}`, // ✅ query param, not path
            { userid, code },
            { headers: { 'Accept': 'text/plain', 'Content-Type': 'application/json' } }
        );
    },



    // Assuming `API_BASE` is already defined
    getGovernance: async (customerId: number, userId: number) => {
        return axios.get(`${API_BASE}/LookUp/UserAssociatedGovDomain?customerId=${customerId}&userId=${userId}`);
    },


    // getGovernanceRoles: async (govId: number,userId: number, customerId: number) => {
    //     return axios.get(`${API_BASE}/LookUp/UserAssociatedRoles?CustomerId=${customerId}&userId=${userId}&GovId=${govId}`);
    // },

    getGovernanceRoles: async (govId: number, customerId: number, userId: number) => {
        return axios.get(`${API_BASE}/LookUp/UserAssociatedRoles`, {
            params: { CustomerId: customerId, Userid: userId, GovId: govId },
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("authToken") || ""}`,
            },
        });
    },


    getCustomerName: async () => {
        return axios.get(`${API_BASE}/customers`);
    }
};
