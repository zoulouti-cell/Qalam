import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { Case, Client, Letterhead, User } from "@/lib/types";

export function useMe() {
  return useQuery({ queryKey: ["me"], queryFn: () => apiGet<User>("/auth/me"), retry: false, staleTime: 60_000 });
}
export const useClients = () => useQuery({ queryKey: ["clients", ""], queryFn: () => apiGet<Client[]>("/clients") });
export const useCases = () => useQuery({ queryKey: ["cases", "", ""], queryFn: () => apiGet<Case[]>("/cases") });
export const useLetterheads = () => useQuery({ queryKey: ["letterheads"], queryFn: () => apiGet<Letterhead[]>("/letterheads") });
export const useTeam = () => useQuery({ queryKey: ["team"], queryFn: () => apiGet<User[]>("/team") });
