// src/services/customerService.ts
import { apiService } from './api';

export const customerService = {
    getCustomers: () => apiService.get('/LookUp/CustomerLookup'),
};
