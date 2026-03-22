import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { toast } from 'react-hot-toast';

/**
 * Example of an optimized data fetching hook for products.
 * Includes caching, error handling, and manual invalidation.
 */
export const useProducts = (filters = {}) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      try {
        const response = await api.get('products/', { params: filters });
        return response.data;
      } catch (error) {
        const message = error.response?.data?.detail || 'Failed to fetch products';
        toast.error(message);
        throw error;
      }
    },
    // Data is considered fresh for 5 minutes, reducing repeated API calls during navigation
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Example of an optimized mutation hook for adding items to cart.
 */
export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity }) => {
      const response = await api.post('cart/add_item/', { product_id: productId, quantity });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Added to cart');
      // Invalidate cart queries to refetch the updated cart data
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      const message = error.response?.data?.error || 'Failed to add to cart';
      toast.error(message);
    }
  });
};
