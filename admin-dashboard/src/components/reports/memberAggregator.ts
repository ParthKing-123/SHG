export function buildMemberSummary(members: any[]) {
  const totalMembers = members.length;
  const activeMembers = members.filter(
    m => m.status === "ACTIVE" || m.active === true
  ).length;

  return {
    totalMembers,
    activeMembers,
    inactiveMembers: totalMembers - activeMembers,
  };
}
