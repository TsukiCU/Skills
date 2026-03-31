import type { TeamMember } from "@/lib/types"

export const MEMBERS: TeamMember[] = [
  { id: "member-1", name: "Alice Chen",    avatar: "AC", color: "bg-teal-500" },
  { id: "member-2", name: "Bob Martinez",  avatar: "BM", color: "bg-violet-500" },
  { id: "member-3", name: "Carol Kim",     avatar: "CK", color: "bg-rose-500" },
  { id: "member-4", name: "David Osei",    avatar: "DO", color: "bg-amber-500" },
]

export function getMember(id: string): TeamMember | undefined {
  return MEMBERS.find((m) => m.id === id)
}
