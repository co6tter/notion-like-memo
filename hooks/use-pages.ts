import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Page } from '@/lib/types'

export function usePages(searchQuery: string = '') {
  const supabase = createClient()
  return useQuery({
    queryKey: ['pages', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('pages')
        .select('*')
        .order('updated_at', { ascending: false })

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return data as Page[]
    }
  })
}

export function usePage(id: string) {
  const supabase = createClient()
  return useQuery({
    queryKey: ['page', id],
    queryFn: async () => {
      if (!id) throw new Error('Page ID is required')
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as Page
    },
    enabled: !!id
  })
}

export function useCreatePage() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (title: string = '') => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('pages')
        .insert([{ 
          title, 
          content: { type: 'doc', content: [] },
          user_id: user.id 
        }])
        .select()
        .single()
      if (error) throw error
      return data as Page
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] })
    }
  })
}

export function useUpdatePage() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Page> & { id: string }) => {
      const { data, error } = await supabase
        .from('pages')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Page
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['page', data.id], data)
      queryClient.invalidateQueries({ queryKey: ['pages'] })
    }
  })
}

export function useDeletePage() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] })
    }
  })
}
