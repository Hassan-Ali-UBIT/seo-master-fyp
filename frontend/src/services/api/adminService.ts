import api from "./axios";

// Types
export interface AdminUser {
    id: number;
    username: string;
    email: string;
    subscription: string;
    status: string;
    joined_date: string;
    last_active: string;
}

export interface AdminPayment {
    id: number;
    user_name: string;
    user_email: string;
    plan_name: string;
    amount: string;
    currency: string;
    status: string;
    mode: string;
    transaction_id: string;
    created_at: string;
}

// Endpoints
export const getAdminUsers = async () => {
    const response = await api.get('/dashboard/users/');
    return response.data.data;
};

export const getAdminPayments = async () => {
    const response = await api.get('/dashboard/payments/');
    return response.data.data;
};
